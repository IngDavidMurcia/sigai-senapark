import React, { useState, useEffect } from 'react';
import { 
  LogIn, LogOut, Laptop, ShieldAlert, User, Car, Bike, PlusCircle, CheckCircle2, QrCode, ArrowRightLeft, Settings
} from 'lucide-react';

const DashboardView = ({ 
  darkMode, 
  plateInput, 
  setPlateInput, 
  logs, 
  users, 
  vehicles, 
  incidents, 
  parkingSpots,
  handleRegister, 
  handleExit, 
  onOpenEmergencyModal 
}) => {
  // Modos de registro
  const [entryMode, setEntryMode] = useState('Vehicular'); // Vehicular, Peatonal
  const [isEmergency, setIsEmergency] = useState(false); // Casos sin documento
  const [assignmentMode, setAssignmentMode] = useState('Auto'); // Auto, Manual
  const [manualSpotId, setManualSpotId] = useState('');

  // Estados locales para el formulario de ingreso
  const [vehicleType, setVehicleType] = useState('Carro');
  const [isPlateRegistered, setIsPlateRegistered] = useState(false);
  const [vehicleOwner, setVehicleOwner] = useState(null);
  
  // Conductor o Peatón
  const [isAlternativeDriver, setIsAlternativeDriver] = useState(false);
  const [driverIdInput, setDriverIdInput] = useState('');
  const [driverUser, setDriverUser] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [driverRole, setDriverRole] = useState('Estudiante');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverCenter, setDriverCenter] = useState('CTM');

  // Roles múltiples
  const [selectedRole, setSelectedRole] = useState('');

  // Activos
  const [selectedAssets, setSelectedAssets] = useState([]); // Array de IDs de activos chuleados
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [temporaryAssets, setTemporaryAssets] = useState([]); // Activos agregados al vuelo
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);

  // Alertas activas para el vehículo o conductor
  const [activeWarnings, setActiveWarnings] = useState([]);

  // Cada vez que cambia el modo o es emergencia, limpiar formulario
  useEffect(() => {
    setPlateInput('');
    setDriverIdInput('');
    setDriverName('');
    setDriverPhone('');
    setIsAlternativeDriver(false);
    setDriverUser(null);
    setVehicleOwner(null);
    setIsPlateRegistered(false);
    setActiveWarnings([]);
  }, [entryMode, isEmergency, setPlateInput]);

  // Cada vez que cambia la placa (Modo Vehicular), buscamos en los vehículos registrados
  useEffect(() => {
    if (entryMode !== 'Vehicular' || isEmergency) return;

    const formattedPlate = plateInput.toUpperCase().trim();
    if (!formattedPlate) {
      setIsPlateRegistered(false);
      setVehicleOwner(null);
      setActiveWarnings([]);
      setTemporaryAssets([]);
      setSelectedAssets([]);
      setIsAlternativeDriver(false);
      return;
    }

    const foundVehicle = vehicles.find(v => v.plate === formattedPlate);
    let warningsList = [];

    const vehicleIncidents = incidents.filter(i => i.targetType === 'vehicle' && i.targetValue === formattedPlate);
    vehicleIncidents.forEach(inc => {
      warningsList.push({ type: 'VEHÍCULO', severity: inc.severity, desc: `${inc.type}: ${inc.description}` });
    });

    if (foundVehicle) {
      setIsPlateRegistered(true);
      setVehicleType(foundVehicle.type);
      
      const owner = users.find(u => u.id === foundVehicle.ownerId);
      if (owner) {
        setVehicleOwner(owner);
        setSelectedRole(owner.roles[0] || 'Estudiante');
        
        const ownerIncidents = incidents.filter(i => i.targetType === 'user' && i.targetValue === owner.id);
        ownerIncidents.forEach(inc => {
          warningsList.push({ type: 'DUEÑO', severity: inc.severity, desc: `${inc.type}: ${inc.description}` });
        });
      }
    } else {
      setIsPlateRegistered(false);
      setVehicleOwner(null);
    }

    setActiveWarnings(warningsList);
  }, [plateInput, vehicles, users, incidents, entryMode, isEmergency]);

  // Buscar conductor alternativo o peatón cuando cambia su ID
  useEffect(() => {
    if (isEmergency) return;
    
    // Si estamos en modo Peatonal, siempre buscamos por driverIdInput
    // Si estamos en modo Vehicular, buscamos si isAlternativeDriver o si la placa no está registrada (usando driverIdInput o directDriverId)
    // Para unificar, usaremos driverIdInput
    
    if (!driverIdInput) {
      setDriverUser(null);
      if (!isAlternativeDriver && isPlateRegistered) {
        // restaurar warnings si borran
      } else {
        setDriverName('');
        setDriverPhone('');
      }
      return;
    }

    const foundUser = users.find(u => u.id === driverIdInput.trim());
    if (foundUser) {
      setDriverUser(foundUser);
      setDriverName(foundUser.name);
      setDriverRole(foundUser.roles[0]);
      setDriverPhone(foundUser.phone || '');
      setDriverCenter(foundUser.center || 'CTM');
      
      const driverIncidents = incidents.filter(i => i.targetType === 'user' && i.targetValue === foundUser.id);
      const newWarnings = driverIncidents.map(inc => ({
        type: entryMode === 'Peatonal' ? 'PEATÓN' : 'CONDUCTOR',
        severity: inc.severity,
        desc: `${inc.type}: ${inc.description}`
      }));
      
      if (entryMode === 'Vehicular') {
        const formattedPlate = plateInput.toUpperCase().trim();
        const vehicleIncidents = incidents.filter(i => i.targetType === 'vehicle' && i.targetValue === formattedPlate);
        const vehicleWarnings = vehicleIncidents.map(inc => ({
          type: 'VEHÍCULO',
          severity: inc.severity,
          desc: `${inc.type}: ${inc.description}`
        }));
        setActiveWarnings([...vehicleWarnings, ...newWarnings]);
      } else {
        setActiveWarnings(newWarnings);
      }
    } else {
      setDriverUser(null);
      setDriverName('');
      setDriverPhone('');
      
      if (entryMode === 'Vehicular') {
        const formattedPlate = plateInput.toUpperCase().trim();
        const vehicleIncidents = incidents.filter(i => i.targetType === 'vehicle' && i.targetValue === formattedPlate);
        const vehicleWarnings = vehicleIncidents.map(inc => ({
          type: 'VEHÍCULO',
          severity: inc.severity,
          desc: `${inc.type}: ${inc.description}`
        }));
        setActiveWarnings(vehicleWarnings);
      } else {
        setActiveWarnings([]);
      }
    }
  }, [isAlternativeDriver, driverIdInput, users, incidents, plateInput, entryMode, isEmergency, isPlateRegistered]);

  const handleAddAsset = () => {
    if (!newAssetName || !newAssetSerial) {
      alert("Por favor ingresa nombre y serial del equipo");
      return;
    }
    const assetId = `dyn-${Date.now()}`;
    const newAsset = { id: assetId, name: newAssetName, serial: newAssetSerial };
    
    setTemporaryAssets([...temporaryAssets, newAsset]);
    setQrAsset(newAsset);
    setShowQRModal(true);
    setNewAssetName('');
    setNewAssetSerial('');
  };

  const submitRegister = () => {
    let finalPlate = '';
    let finalVehicleType = '';
    let finalDriverId = '';
    let finalDriverName = '';
    let finalDriverRole = '';
    let finalDriverPhone = '';
    let finalDriverCenter = '';
    let finalOwnerId = '';

    if (isEmergency) {
      finalDriverName = driverName || 'Emergencia / Proveedor';
      finalDriverRole = 'Servicio Especial';
      finalDriverCenter = driverCenter;
      finalPlate = plateInput ? plateInput.toUpperCase().trim() : '';
      if (!finalPlate && entryMode === 'Vehicular') finalPlate = `EMERG-${Date.now().toString().slice(-4)}`;
      if (entryMode === 'Vehicular') finalVehicleType = vehicleType;
    } else {
      if (entryMode === 'Vehicular') {
        finalPlate = plateInput.toUpperCase().trim();
        if (!finalPlate) return;

        if (logs.some(l => l.plate && l.plate === finalPlate)) {
          alert(`EL VEHÍCULO CON PLACA ${finalPlate} YA SE ENCUENTRA EN PLANTA`);
          return;
        }

        finalVehicleType = vehicleType;
        finalOwnerId = vehicleOwner ? vehicleOwner.id : '';

        if (isPlateRegistered) {
          if (isAlternativeDriver) {
            if (driverUser) {
              finalDriverId = driverUser.id;
              finalDriverName = driverUser.name;
              finalDriverRole = selectedRole || driverUser.roles[0];
              finalDriverPhone = driverPhone;
              finalDriverCenter = driverCenter;
            } else {
              finalDriverId = driverIdInput || `VIS-${Date.now()}`;
              finalDriverName = driverName || 'Visitante Alterno';
              finalDriverRole = 'Visitante';
              finalDriverPhone = driverPhone;
              finalDriverCenter = driverCenter;
            }
          } else {
            finalDriverId = vehicleOwner.id;
            finalDriverName = vehicleOwner.name;
            finalDriverRole = selectedRole || vehicleOwner.roles[0];
            finalDriverPhone = vehicleOwner.phone;
            finalDriverCenter = vehicleOwner.center;
          }
        } else {
          if (driverUser) {
            finalDriverId = driverUser.id;
            finalDriverName = driverUser.name;
            finalDriverRole = selectedRole || driverUser.roles[0];
            finalDriverPhone = driverPhone;
            finalDriverCenter = driverCenter;
          } else {
            finalDriverId = driverIdInput || `VIS-${Date.now()}`;
            finalDriverName = driverName || 'Visitante';
            finalDriverRole = driverRole;
            finalDriverPhone = driverPhone;
            finalDriverCenter = driverCenter;
          }
        }
      } else {
        // Peatonal
        if (!driverName) {
          alert("Por favor ingresa el nombre de la persona");
          return;
        }
        
        finalPlate = ''; // Sin placa
        finalVehicleType = 'Peatón';
        
        if (driverUser) {
          finalDriverId = driverUser.id;
          finalDriverName = driverUser.name;
          finalDriverRole = selectedRole || driverUser.roles[0];
          finalDriverPhone = driverPhone;
          finalDriverCenter = driverCenter;
        } else {
          finalDriverId = driverIdInput || `VIS-${Date.now()}`;
          finalDriverName = driverName;
          finalDriverRole = driverRole;
          finalDriverPhone = driverPhone;
          finalDriverCenter = driverCenter;
        }
      }
    }

    if (!finalDriverName) {
      alert("Por favor ingresa el nombre de la persona");
      return;
    }

    // Asignación de Parqueadero
    let finalSpotId = null;
    if (entryMode === 'Vehicular' && finalVehicleType !== 'Peatón') {
      if (assignmentMode === 'Manual' && manualSpotId) {
        finalSpotId = manualSpotId;
      } else if (assignmentMode === 'Auto') {
        const availableSpots = parkingSpots.filter(s => s.status === 'libre' && s.vehicleType === finalVehicleType);
        if (availableSpots.length > 0) {
          finalSpotId = availableSpots[0].id;
        } else {
          alert(`No hay cupos disponibles para ${finalVehicleType}.`);
          return; // No permitir ingreso si no hay cupo
        }
      }
    }

    const ownerAssets = vehicleOwner ? vehicleOwner.assets : (driverUser ? driverUser.assets : []);
    const checkedAssets = ownerAssets.filter(a => selectedAssets.includes(a.id));
    const allAssets = [...checkedAssets, ...temporaryAssets];

    const entryData = {
      plate: finalPlate,
      vehicleType: finalVehicleType,
      ownerId: finalOwnerId,
      driverId: finalDriverId,
      driverName: finalDriverName,
      driverRole: finalDriverRole,
      driverPhone: finalDriverPhone,
      center: finalDriverCenter,
      assets: allAssets,
      entryTime: new Date(),
      assignedSpotId: finalSpotId
    };

    handleRegister(entryData);

    // Resetear
    setPlateInput('');
    setIsAlternativeDriver(false);
    setDriverIdInput('');
    setDriverName('');
    setDriverPhone('');
    setSelectedAssets([]);
    setTemporaryAssets([]);
    setIsEmergency(false);
  };

  const getAvailableSpots = () => {
    if (!parkingSpots) return [];
    return parkingSpots.filter(s => s.status === 'libre' && s.vehicleType === vehicleType);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {activeWarnings.length > 0 && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 p-5 rounded-2xl animate-pulse flex items-start gap-4">
          <ShieldAlert className="text-rose-500 shrink-0 mt-1" size={28} />
          <div>
            <h4 className="text-rose-500 font-bold text-lg uppercase tracking-tight">¡Alerta de Seguridad o Infracciones!</h4>
            <div className="mt-2 space-y-1 text-sm text-rose-300">
              {activeWarnings.map((warn, i) => (
                <p key={i}>
                  <span className="font-extrabold">[{warn.type}]:</span> {warn.desc}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL DE REGISTRO */}
        <div className={`${darkMode ? 'bg-slate-900 border-emerald-500/20' : 'bg-white border-emerald-100 shadow-2xl'} p-8 rounded-3xl border-2 lg:col-span-1 space-y-6`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LogIn className="text-emerald-500" size={24} />
              <h3 className="text-xl font-bold tracking-tight">Registro de Portería</h3>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* TOGGLES PRINCIPALES */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setEntryMode('Vehicular')}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  entryMode === 'Vehicular' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Vehicular
              </button>
              <button
                onClick={() => setEntryMode('Peatonal')}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  entryMode === 'Peatonal' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Peatonal
              </button>
            </div>

            <label htmlFor="emergency-checkbox" className="flex items-center gap-3 p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-all text-rose-400">
              <input 
                id="emergency-checkbox"
                name="emergency-checkbox"
                type="checkbox" 
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-5 h-5 accent-rose-500 rounded" 
              />
              <div className="text-xs">
                <p className="font-bold uppercase tracking-tight">Ingreso Especial / Sin Documento</p>
                <p className="text-[10px] opacity-70">Emergencia, Policía, Proveedores</p>
              </div>
            </label>

            {/* FORMULARIO */}
            {!isEmergency && entryMode === 'Vehicular' && (
              <div>
                <label htmlFor="plate-input" className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  Placa del Vehículo
                </label>
                <input 
                  id="plate-input"
                  name="plate-input"
                  type="text" 
                  value={plateInput} 
                  onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                  placeholder="ABC123" 
                  className={`w-full p-4 rounded-xl border-2 text-3xl font-black text-center tracking-widest uppercase focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'
                  }`} 
                />
              </div>
            )}

            {!isEmergency && entryMode === 'Vehicular' && !isPlateRegistered && plateInput.trim().length > 0 && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-200">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  Tipo de Vehículo
                </label>
                <div className="flex gap-2">
                  {['Carro', 'Moto', 'Bici'].map(type => (
                    <button 
                      key={type} 
                      type="button" 
                      onClick={() => setVehicleType(type)}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all uppercase ${
                        vehicleType === type 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' 
                          : 'border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {type === 'Carro' ? <Car size={14} className="inline mr-1" /> : <Bike size={14} className="inline mr-1" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isEmergency && entryMode === 'Vehicular' && isPlateRegistered && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Tipo de Vehículo Registrado:</span>
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full font-black uppercase tracking-wider">
                  {vehicleType}
                </span>
              </div>
            )}

            {!isEmergency && (entryMode === 'Peatonal' || (entryMode === 'Vehicular' && (!isPlateRegistered || isAlternativeDriver) && plateInput.trim().length > 0)) && (
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                  Datos de la Persona
                </p>
                
                <div>
                  <label htmlFor="driver-id-input" className="sr-only">Documento de Identidad</label>
                  <input 
                    id="driver-id-input"
                    name="driver-id-input"
                    type="text" 
                    placeholder="Documento de Identidad"
                    value={driverIdInput}
                    onChange={(e) => setDriverIdInput(e.target.value)}
                    className={`w-full p-2.5 rounded-lg text-sm outline-none border focus:border-orange-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="driver-name-input" className="sr-only">Nombre Completo</label>
                  <input 
                    id="driver-name-input"
                    name="driver-name-input"
                    type="text" 
                    placeholder="Nombre Completo"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  disabled={!!driverUser}
                  className={`w-full p-2.5 rounded-lg text-sm outline-none border ${
                    darkMode ? 'bg-slate-800 disabled:bg-slate-900/50' : 'bg-white disabled:bg-gray-100'
                  }`}
                />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label htmlFor="driver-role-select" className="sr-only">Rol</label>
                    <select 
                      id="driver-role-select"
                      name="driver-role-select"
                      value={driverRole}
                      onChange={(e) => setDriverRole(e.target.value)}
                      disabled={!!driverUser}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <option value="Estudiante">Estudiante</option>
                      <option value="Instructor">Instructor</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Visitante">Visitante</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="driver-center-select" className="sr-only">Centro</label>
                    <select 
                      id="driver-center-select"
                      name="driver-center-select"
                      value={driverCenter}
                      onChange={(e) => setDriverCenter(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <option value="CTM">CTM</option>
                      <option value="CUERO">CUERO</option>
                      <option value="CONFECCIONES">CONFECCIONES</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                </div>

                {driverUser && driverUser.roles.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                      Selecciona Rol de Ingreso
                    </label>
                    <div className="flex gap-2">
                      {driverUser.roles.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRole(r)}
                          className={`flex-1 py-1.5 rounded-md border font-bold text-[10px] uppercase transition-all ${
                            selectedRole === r 
                              ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                              : 'border-slate-800 text-slate-500'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isEmergency && entryMode === 'Vehicular' && isPlateRegistered && vehicleOwner && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Propietario Registrado</p>
                  <p className="text-md font-extrabold text-emerald-400">
                    {vehicleOwner.name}
                  </p>
                  <p className="text-xs text-slate-400 italic mt-0.5">ID: {vehicleOwner.id} | Centro: {vehicleOwner.center}</p>
                </div>

                <label htmlFor="alternative-driver-checkbox" className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800/20 transition-all">
                  <input 
                    id="alternative-driver-checkbox"
                    name="alternative-driver-checkbox"
                    type="checkbox" 
                    checked={isAlternativeDriver}
                    onChange={(e) => {
                      setIsAlternativeDriver(e.target.checked);
                      if (!e.target.checked) setDriverIdInput('');
                    }}
                    className="w-5 h-5 accent-emerald-500 rounded" 
                  />
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-tight">¿Conducido por otra persona?</p>
                    <p className="text-[10px] text-slate-500">Registrar conductor alternativo</p>
                  </div>
                </label>
              </div>
            )}

            {isEmergency && (
              <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                <div>
                  <label htmlFor="emergency-name-input" className="sr-only">Nombre o Entidad</label>
                  <input 
                    id="emergency-name-input"
                    name="emergency-name-input"
                    type="text" 
                    placeholder="Nombre o Entidad (Ej. Ambulancia, Policía)"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg text-sm outline-none border focus:border-rose-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
                {entryMode === 'Vehicular' && (
                  <div>
                    <label htmlFor="emergency-plate-input" className="sr-only">Placa (Opcional)</label>
                    <input 
                      id="emergency-plate-input"
                      name="emergency-plate-input"
                      type="text" 
                      placeholder="Placa (Opcional)"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                      className={`w-full p-2.5 rounded-lg text-sm outline-none border focus:border-rose-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="emergency-center-select" className="sr-only">Centro</label>
                  <select 
                    id="emergency-center-select"
                    name="emergency-center-select"
                    value={driverCenter}
                    onChange={(e) => setDriverCenter(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                  >
                    <option value="CTM">CTM</option>
                    <option value="CUERO">CUERO</option>
                    <option value="CONFECCIONES">CONFECCIONES</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
              </div>
            )}

            {/* ASIGNACIÓN DE PARQUEADERO (Solo Vehicular) */}
            {entryMode === 'Vehicular' && (isEmergency || plateInput.trim().length > 0) && (
              <div className="p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cupo de Parqueadero</p>
                  <div className="flex bg-slate-800 p-1 rounded-md text-[9px] font-bold">
                    <button
                      onClick={() => setAssignmentMode('Auto')}
                      className={`px-2 py-1 rounded ${assignmentMode === 'Auto' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}
                    >
                      AUTO
                    </button>
                    <button
                      onClick={() => setAssignmentMode('Manual')}
                      className={`px-2 py-1 rounded ${assignmentMode === 'Manual' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}
                    >
                      MANUAL
                    </button>
                  </div>
                </div>

                {assignmentMode === 'Auto' ? (
                  <div className="text-xs text-blue-400 italic bg-blue-500/10 p-2 rounded">
                    El sistema asignará automáticamente el primer cupo libre de {vehicleType}.
                  </div>
                ) : (
                  <div>
                    <label htmlFor="manual-spot-select" className="sr-only">Seleccione Cupo</label>
                    <select
                      id="manual-spot-select"
                      name="manual-spot-select"
                      value={manualSpotId}
                      onChange={(e) => setManualSpotId(e.target.value)}
                      className={`w-full p-2.5 rounded-lg text-xs outline-none border focus:border-blue-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="">Seleccione Cupo...</option>
                      {getAvailableSpots().map(s => (
                        <option key={s.id} value={s.id}>{s.label} ({s.type})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVOS */}
            {((!isEmergency && driverIdInput) || (isPlateRegistered)) && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Registrar Activo</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <label htmlFor="asset-name-input" className="sr-only">Tipo (Portátil)</label>
                    <input 
                      id="asset-name-input"
                      name="asset-name-input"
                      type="text" 
                      placeholder="Tipo (Portátil)" 
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      className={`w-full p-2 rounded outline-none border focus:border-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="asset-serial-input" className="sr-only">Serial</label>
                    <input 
                      id="asset-serial-input"
                      name="asset-serial-input"
                      type="text" 
                      placeholder="Serial" 
                      value={newAssetSerial}
                      onChange={(e) => setNewAssetSerial(e.target.value)}
                      className={`w-full p-2 rounded outline-none border focus:border-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleAddAsset}
                  className="w-full py-2 bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 rounded font-bold text-xs uppercase transition-all"
                >
                  Agregar Equipo
                </button>
              </div>
            )}

            <button 
              onClick={submitRegister}
              disabled={(!isEmergency && entryMode === 'Vehicular' && plateInput.trim().length === 0) || (!isEmergency && entryMode === 'Peatonal' && driverIdInput.trim().length === 0) || (isEmergency && driverName.trim().length === 0)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl text-lg font-black tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={22} />
              CONFIRMAR INGRESO
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} p-8 rounded-3xl border space-y-6`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold italic tracking-tight">Personal / Vehículos en Planta</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monitoreo General</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
              {logs.length} Activos
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="pb-4">Placa / Tipo</th>
                  <th className="pb-4">Persona / Destino</th>
                  <th className="pb-4 text-center">Activos</th>
                  <th className="pb-4 text-right">Ingreso</th>
                  <th className="pb-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-800/10 transition-all">
                    <td className="py-4">
                      {log.plate ? (
                        <>
                          <span className="text-xl font-black font-mono text-emerald-400 block">{log.plate}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            {log.vehicleType === 'Carro' ? <Car size={10} /> : <Bike size={10} />}
                            {log.vehicleType}
                            {log.assignedSpotId && <span className="text-blue-400">({log.assignedSpotId})</span>}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-black font-mono text-orange-400 block">PEATÓN</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span 
                          onClick={() => onOpenEmergencyModal(log)}
                          className="text-md font-extrabold text-slate-200 group-hover:text-white cursor-pointer hover:underline"
                        >
                          {log.driverName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{log.driverRole}</span>
                          <span>•</span>
                          <span className="text-emerald-500">{log.center}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      {log.assets && log.assets.length > 0 ? (
                        <button className="inline-flex p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                          <Laptop size={16} /><span className="text-xs font-black ml-1">{log.assets.length}</span>
                        </button>
                      ) : <span className="text-slate-700 font-bold">-</span>}
                    </td>
                    <td className="py-4 text-right text-sm font-mono font-bold text-slate-400">
                      {new Date(log.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleExit(log.id)}
                        aria-label="Registrar salida"
                        className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                      >
                        <LogOut size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showQRModal && qrAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full text-center space-y-5">
            <QrCode size={36} className="mx-auto text-emerald-400 bg-emerald-500/10 p-2 rounded-full w-16 h-16" />
            <h4 className="text-lg font-black text-slate-100 uppercase tracking-tight">QR Generado</h4>
            <div className="bg-slate-950 p-4 rounded-2xl text-left border border-slate-800 space-y-1">
              <p className="text-sm font-extrabold text-slate-200">{qrAsset.name}</p>
              <p className="text-xs font-mono text-emerald-400 font-bold">SERIAL: {qrAsset.serial}</p>
            </div>
            <button 
              onClick={() => { setShowQRModal(false); setQrAsset(null); }}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold uppercase"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
