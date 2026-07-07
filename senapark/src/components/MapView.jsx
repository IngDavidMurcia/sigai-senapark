import React, { useState } from 'react';
import { 
  Building2, PlusCircle, Trash2, Edit3, Settings, ShieldAlert, Laptop, Eye, HelpCircle, Filter
} from 'lucide-react';

const MapView = ({ 
  darkMode, 
  parkingSpots, 
  setParkingSpots, 
  logs, 
  onOpenEmergencyModal 
}) => {
  const [selectedFilter, setSelectedFilter] = useState('TODOS');
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Detalle del cupo seleccionado al hacer clic
  const [selectedSpotDetail, setSelectedSpotDetail] = useState(null);
  
  // Formulario para agregar cupo
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpotType, setNewSpotType] = useState('General');
  const [newSpotVehicle, setNewSpotVehicle] = useState('Carro');
  const [newSpotLabel, setNewSpotLabel] = useState('');

  // Formulario para editar cupo
  const [editingSpot, setEditingSpot] = useState(null);

  // Separar cupos por tipo de vehículo
  const carSpots = parkingSpots.filter(s => s.vehicleType === 'Carro');
  const motoSpots = parkingSpots.filter(s => s.vehicleType === 'Moto');
  const biciSpots = parkingSpots.filter(s => s.vehicleType === 'Bici');

  // Lógica para agregar un nuevo cupo
  const handleAddSpot = () => {
    if (!newSpotLabel) {
      alert("Por favor ingresa una etiqueta para el cupo (Ej: C-20)");
      return;
    }

    const newId = `GEN-${newSpotVehicle[0]}-${Date.now()}`;
    const newSpot = {
      id: newId,
      center: 'GENERAL',
      vehicleType: newSpotVehicle,
      label: newSpotLabel.toUpperCase(),
      type: newSpotType,
      status: 'libre',
      occupiedBy: null
    };

    setParkingSpots([...parkingSpots, newSpot]);
    setNewSpotLabel('');
    setShowAddForm(false);
  };

  // Lógica para guardar edición de cupo
  const handleSaveEdit = () => {
    if (!editingSpot.label) {
      alert("La etiqueta no puede estar vacía");
      return;
    }

    setParkingSpots(parkingSpots.map(s => {
      if (s.id === editingSpot.id) {
        // Si lo pasamos a libre o mantenimiento, y estaba ocupado, habría que soltarlo, pero por ahora confiaremos
        // en que el administrador sabe lo que hace, o podemos limpiar occupiedBy si status no es 'ocupado'
        let newOccupiedBy = editingSpot.occupiedBy;
        if (editingSpot.status !== 'ocupado') {
          newOccupiedBy = null;
        }

        return { ...editingSpot, label: editingSpot.label.toUpperCase(), occupiedBy: newOccupiedBy };
      }
      return s;
    }));

    setEditingSpot(null);
    setSelectedSpotDetail(null);
  };

  // Lógica para eliminar un cupo
  const handleDeleteSpot = (spotId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cupo de parqueadero?")) {
      setParkingSpots(parkingSpots.filter(s => s.id !== spotId));
      setSelectedSpotDetail(null);
      setEditingSpot(null);
    }
  };

  // Ayuda para las clases CSS según el tipo de cupo
  const getSpotStyles = (spot) => {
    if (spot.status === 'ocupado') {
      return 'bg-rose-500/10 border-rose-500 text-rose-400 hover:bg-rose-500/20';
    }
    
    if (spot.status === 'mantenimiento') {
      return 'bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20';
    }

    if (spot.status === 'novedad') {
      return 'bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500/20';
    }

    if (spot.status === 'no disponible') {
      return 'bg-slate-500/10 border-slate-500 text-slate-500 hover:bg-slate-500/20';
    }
    
    switch (spot.type) {
      case 'Discapacitados':
        return 'bg-blue-500/10 border-blue-500 text-blue-400 hover:bg-blue-500/20';
      case 'Reservado Directivos':
        return 'bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500/20';
      default:
        return 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20';
    }
  };

  const getSpotStatusLabel = (spot) => {
    if (spot.status === 'ocupado') return spot.occupiedBy?.plate || 'OCUPADO';
    if (spot.status === 'mantenimiento') return 'MANTENIMIENTO';
    if (spot.status === 'novedad') return 'NOVEDAD';
    if (spot.status === 'no disponible') return 'N/D';
    return spot.type === 'General' ? 'Libre' : spot.type === 'Discapacitados' ? '♿' : '⭐';
  };

  // Renderizar la cuadrícula de parqueos
  const renderSpotGrid = (title, spotsList, type) => {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex justify-between items-center">
          <span>Cupos de {title}</span>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
            Disponibles: {spotsList.filter(s => s.status === 'libre').length} / {spotsList.length}
          </span>
        </h4>
        
        {spotsList.length === 0 ? (
          <p className="text-xs text-slate-600 italic">No hay cupos registrados en esta zona.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {spotsList.map((spot) => {
              const isOcupado = spot.status === 'ocupado';
              // Lógica de atenuación si el filtro no es TODOS
              const isMuted = selectedFilter !== 'TODOS' && (!isOcupado || spot.occupiedBy?.center !== selectedFilter);

              return (
                <button
                  key={spot.id}
                  onClick={() => {
                    setSelectedSpotDetail(spot);
                    setEditingSpot(spot);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center font-bold text-center gap-1 min-h-[70px] relative overflow-hidden group ${getSpotStyles(spot)} ${isMuted ? 'opacity-25 grayscale' : 'opacity-100'}`}
                >
                  <span className="text-xs font-black font-mono tracking-tight block">{spot.label}</span>
                  {isOcupado ? (
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tight animate-in zoom-in-50 duration-200">
                      {getSpotStatusLabel(spot)}
                    </span>
                  ) : (
                    <span className="text-[8px] opacity-60 uppercase font-medium text-center">
                      {getSpotStatusLabel(spot)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER DE MAPA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        {/* SELECTOR DE FILTRO DE CENTRO */}
        <div className="flex flex-wrap gap-2">
          {['TODOS', 'CTM', 'CUERO', 'CONFECCIONES', 'OTRO'].map(c => (
            <button
              key={c}
              onClick={() => {
                setSelectedFilter(c);
                setSelectedSpotDetail(null);
                setEditingSpot(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-black text-sm uppercase transition-all flex items-center gap-2 ${
                selectedFilter === c
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-400' : 'bg-white border text-slate-600 hover:bg-gray-100'
              }`}
            >
              {c === 'TODOS' ? <Filter size={16} /> : <Building2 size={16} />}
              {c === 'OTRO' ? 'Otros Destinos' : c === 'TODOS' ? 'Todos' : `Centro ${c}`}
            </button>
          ))}
        </div>

        {/* MODO EDICIÓN */}
        <button
          onClick={() => {
            setIsAdminMode(!isAdminMode);
            setSelectedSpotDetail(null);
            setEditingSpot(null);
            setShowAddForm(false);
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-2 ${
            isAdminMode 
              ? 'bg-orange-600 text-white shadow-lg' 
              : darkMode ? 'bg-slate-900 hover:bg-slate-800 text-orange-500 border border-orange-500/10' : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Settings size={16} />
          {isAdminMode ? 'Guardar Cambios' : 'Modo Editor de Zonas'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* GRILLAS DE CUPOS */}
        <div className="lg:col-span-3 space-y-10">
          {renderSpotGrid("Carros", carSpots, "Carro")}
          {renderSpotGrid("Motos", motoSpots, "Moto")}
          {renderSpotGrid("Bicicletas", biciSpots, "Bici")}
        </div>

        {/* PANEL LATERAL DE DETALLE O EDICIÓN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* LEYENDA DEL MAPA */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Leyenda de Parqueo</h4>
            <div className="space-y-2.5 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-emerald-500/10 border-2 border-emerald-500 rounded-lg"></div>
                <span className="text-slate-300">Libre (General)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-rose-500/10 border-2 border-rose-500 rounded-lg"></div>
                <span className="text-slate-300">Ocupado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-purple-500/10 border-2 border-purple-500 rounded-lg"></div>
                <span className="text-slate-300">Reservado Directivo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/10 border-2 border-blue-500 rounded-lg"></div>
                <span className="text-slate-300">Discapacitados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-yellow-500/10 border-2 border-yellow-500 rounded-lg"></div>
                <span className="text-slate-300">Mantenimiento</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-orange-500/10 border-2 border-orange-500 rounded-lg"></div>
                <span className="text-slate-300">Novedad</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-slate-500/10 border-2 border-slate-500 rounded-lg"></div>
                <span className="text-slate-300">No Disponible</span>
              </div>
            </div>
          </div>

          {/* AGREGAR CUPO (Solo Admin Mode) */}
          {isAdminMode && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Agregar Nuevo Cupo
            </button>
          )}

          {/* FORMULARIO AGREGAR CUPO */}
          {isAdminMode && showAddForm && (
            <div className={`p-6 rounded-3xl border-2 border-orange-500/30 ${darkMode ? 'bg-slate-900' : 'bg-white'} space-y-4 animate-in slide-in-from-bottom-4`}>
              <h4 className="text-sm font-black text-orange-500 uppercase tracking-wide">Nuevo Cupo General</h4>
              
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Tipo de Vehículo</label>
                <div className="flex gap-2 mt-1">
                  {['Carro', 'Moto', 'Bici'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewSpotVehicle(v)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${
                        newSpotVehicle === v ? 'border-orange-500 bg-orange-500/15 text-orange-400' : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Categoría</label>
                <select
                  value={newSpotType}
                  onChange={(e) => setNewSpotType(e.target.value)}
                  className={`w-full mt-1 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                >
                  <option value="General">General</option>
                  <option value="Reservado Directivos">Reservado Directivo</option>
                  <option value="Discapacitados">Discapacitados</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Etiqueta (Eje: C-05, M-15)</label>
                <input
                  type="text"
                  placeholder="Etiqueta"
                  value={newSpotLabel}
                  onChange={(e) => setNewSpotLabel(e.target.value)}
                  className={`w-full mt-1 p-2.5 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddSpot}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs uppercase"
                >
                  Crear
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* MOSTRAR DETALLES DEL CUPO SELECCIONADO */}
          {selectedSpotDetail && !isAdminMode && (
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} space-y-5 animate-in fade-in duration-200`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-black text-slate-100 font-mono">{selectedSpotDetail.label}</h4>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Complejo | {selectedSpotDetail.vehicleType}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedSpotDetail.status === 'ocupado' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedSpotDetail.status}
                </span>
              </div>

              {selectedSpotDetail.status === 'ocupado' ? (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Vehículo</p>
                    <p 
                      onClick={() => onOpenEmergencyModal(logs.find(l => l.plate === selectedSpotDetail.occupiedBy?.plate) || { plate: selectedSpotDetail.occupiedBy?.plate, driverName: selectedSpotDetail.occupiedBy?.driverName })}
                      className="text-2xl font-black font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      {selectedSpotDetail.occupiedBy?.plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Conductor</p>
                    <p 
                      onClick={() => onOpenEmergencyModal(logs.find(l => l.plate === selectedSpotDetail.occupiedBy?.plate) || { plate: selectedSpotDetail.occupiedBy?.plate, driverName: selectedSpotDetail.occupiedBy?.driverName })}
                      className="text-md font-extrabold text-slate-200 hover:underline cursor-pointer"
                    >
                      {selectedSpotDetail.occupiedBy?.driverName}
                    </p>
                  </div>
                  {selectedSpotDetail.occupiedBy?.center && (
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Destino</p>
                      <p className="text-sm font-semibold text-emerald-500 uppercase">{selectedSpotDetail.occupiedBy.center}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Hora de Ingreso</p>
                    <p className="text-sm font-semibold text-slate-400">
                      {new Date(selectedSpotDetail.occupiedBy?.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const logInfo = logs.find(l => l.plate === selectedSpotDetail.occupiedBy?.plate);
                      if (logInfo) {
                        onOpenEmergencyModal(logInfo);
                      } else {
                        alert("No se encontraron detalles de contacto para esta visita.");
                      }
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> Ficha de Emergencia
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-500 italic">
                  Este cupo se encuentra vacío o inactivo en este momento. Los ingresos a este tipo de vehículo se le asignarán automáticamente si está libre.
                </div>
              )}
            </div>
          )}

          {/* EDITAR CUPO (Solo Admin Mode) */}
          {selectedSpotDetail && isAdminMode && editingSpot && (
            <div className={`p-6 rounded-3xl border-2 border-orange-500/30 ${darkMode ? 'bg-slate-900' : 'bg-white'} space-y-4 animate-in fade-in duration-200`}>
              <h4 className="text-sm font-black text-orange-500 uppercase tracking-wide">Editar Cupo</h4>
              
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Etiqueta</label>
                <input
                  type="text"
                  value={editingSpot.label}
                  onChange={(e) => setEditingSpot({ ...editingSpot, label: e.target.value })}
                  className={`w-full mt-1 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Categoría</label>
                <select
                  value={editingSpot.type}
                  onChange={(e) => setEditingSpot({ ...editingSpot, type: e.target.value })}
                  className={`w-full mt-1 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                >
                  <option value="General">General</option>
                  <option value="Reservado Directivos">Reservado Directivo</option>
                  <option value="Discapacitados">Discapacitados</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Estado Actual</label>
                <select
                  value={editingSpot.status}
                  onChange={(e) => setEditingSpot({ ...editingSpot, status: e.target.value })}
                  className={`w-full mt-1 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                >
                  <option value="libre">Libre</option>
                  {editingSpot.status === 'ocupado' && <option value="ocupado">Ocupado</option>}
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="novedad">Novedad</option>
                  <option value="no disponible">No Disponible</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs uppercase"
                >
                  Guardar
                </button>
                <button
                  onClick={() => handleDeleteSpot(editingSpot.id)}
                  className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                  title="Eliminar Cupo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MapView;
