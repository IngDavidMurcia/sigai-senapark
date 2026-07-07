import React, { useState } from 'react';
import { 
  User, Plus, Search, Edit3, Trash2, ShieldAlert, Car, Laptop, Clock, Check, X
} from 'lucide-react';

const UsersView = ({ 
  darkMode, 
  users, 
  setUsers, 
  vehicles, 
  setVehicles, 
  history, 
  incidents 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Control de Formularios
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Estados locales para crear/editar
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]); // Array de roles chuleados
  const [phone, setPhone] = useState('');
  const [center, setCenter] = useState('CTM');
  const [platesInput, setPlatesInput] = useState(''); // Coma-separated
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialReason, setSpecialReason] = useState('');
  
  // Activos del usuario en edición/creación
  const [userAssets, setUserAssets] = useState([]);
  const [newAssetLabel, setNewAssetLabel] = useState('');
  const [newAssetSerial, setNewAssetSerial] = useState('');

  // Filtrado de usuarios
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.id.includes(term) ||
      u.plates.some(p => p.toLowerCase().includes(term))
    );
  });

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddAsset = () => {
    if (!newAssetLabel || !newAssetSerial) return;
    const newAsset = {
      id: `ast-${Date.now()}`,
      name: newAssetLabel,
      serial: newAssetSerial.toUpperCase()
    };
    setUserAssets([...userAssets, newAsset]);
    setNewAssetLabel('');
    setNewAssetSerial('');
  };

  const handleRemoveAsset = (assetId) => {
    setUserAssets(userAssets.filter(a => a.id !== assetId));
  };

  const openAddForm = () => {
    setId('');
    setName('');
    setSelectedRoles(['Estudiante']);
    setPhone('');
    setCenter('CTM');
    setPlatesInput('');
    setIsSpecial(false);
    setSpecialReason('');
    setUserAssets([]);
    setEditingUser(null);
    setShowAddForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setId(user.id);
    setName(user.name);
    setSelectedRoles(user.roles || []);
    setPhone(user.phone || '');
    setCenter(user.center || 'CTM');
    setPlatesInput((user.plates || []).join(', '));
    setIsSpecial(user.isSpecial || false);
    setSpecialReason(user.specialReason || '');
    setUserAssets(user.assets || []);
    setShowAddForm(true);
  };

  const handleSaveUser = () => {
    if (!id || !name || selectedRoles.length === 0) {
      alert("Por favor completa los campos obligatorios: ID, Nombre y al menos un Rol.");
      return;
    }

    // Procesar placas
    const processedPlates = platesInput
      .split(',')
      .map(p => p.trim().toUpperCase())
      .filter(p => p.length > 0);

    // Validar ID único si estamos creando
    if (!editingUser) {
      if (users.some(u => u.id === id)) {
        alert(`Ya existe un usuario registrado con el ID ${id}`);
        return;
      }
    }

    // Validar placas únicas en el sistema (excluyendo el usuario que se edita)
    for (const plate of processedPlates) {
      const existingVehicle = vehicles.find(v => v.plate === plate);
      if (existingVehicle) {
        // Si pertenece a otro usuario, lanzar error
        const isSelfPlate = editingUser && editingUser.plates.includes(plate);
        if (!isSelfPlate) {
          alert(`La placa ${plate} ya está registrada a nombre del usuario ID ${existingVehicle.ownerId}`);
          return;
        }
      }
    }

    const userData = {
      id,
      name,
      roles: selectedRoles,
      phone,
      center,
      plates: processedPlates,
      assets: userAssets,
      isSpecial,
      specialReason: isSpecial ? specialReason : ''
    };

    if (editingUser) {
      // Modificar usuario
      setUsers(users.map(u => u.id === editingUser.id ? userData : u));
      
      // Limpiar vehículos antiguos del usuario y registrar los nuevos
      const filteredVehicles = vehicles.filter(v => v.ownerId !== editingUser.id);
      const newVehicles = processedPlates.map(p => ({
        plate: p,
        type: p.length > 3 ? 'Carro' : 'Moto', // inferencia
        ownerId: id
      }));
      setVehicles([...filteredVehicles, ...newVehicles]);
    } else {
      // Nuevo usuario
      setUsers([...users, userData]);
      
      // Registrar nuevos vehículos
      const newVehicles = processedPlates.map(p => ({
        plate: p,
        type: p.length > 3 ? 'Carro' : 'Moto',
        ownerId: id
      }));
      setVehicles([...vehicles, ...newVehicles]);
    }

    setShowAddForm(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario? Esto también eliminará sus vehículos asociados.")) {
      setUsers(users.filter(u => u.id !== userId));
      setVehicles(vehicles.filter(v => v.ownerId !== userId));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER CON BUSCADOR */}
      {!showAddForm && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Nombre, Placa o Cédula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-slate-100' : 'bg-white border-gray-200 focus:border-emerald-500 text-slate-900'
              }`}
            />
          </div>
          <button
            onClick={openAddForm}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={16} /> Registrar Usuario
          </button>
        </div>
      )}

      {/* VISTA DE LISTADO */}
      {!showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const userHistory = history.filter(h => h.driverId === user.id || h.ownerId === user.id);
            const userIncidents = incidents.filter(i => (i.targetType === 'user' && i.targetValue === user.id) || (i.targetType === 'vehicle' && user.plates.includes(i.targetValue)));
            
            return (
              <div 
                key={user.id} 
                className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] flex flex-col justify-between gap-6 ${
                  darkMode ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Cabecera Tarjeta */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-100 text-lg leading-tight">{user.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">ID: {user.id}</span>
                      </div>
                    </div>
                    {user.isSpecial && (
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                        Reservado
                      </span>
                    )}
                  </div>

                  {/* Badges de Roles */}
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(r => (
                      <span key={r} className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {r}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500 px-2 py-0.5">Centro: <span className="text-emerald-500 font-bold">{user.center}</span></span>
                  </div>

                  {/* Placas y Activos */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/40 text-xs">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Vehículos</p>
                      {user.plates.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.plates.map(p => (
                            <span key={p} className="font-mono font-black text-emerald-400 tracking-tighter text-sm">
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Ninguno</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Equipos Autorizados</p>
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <Laptop size={14} className="text-slate-500" />
                        {user.assets?.length || 0} Registrados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Métricas rápidas y Acciones */}
                <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs">
                  <div className="flex gap-3 text-slate-500">
                    <span className="flex items-center gap-1" title="Visitas completadas">
                      <Clock size={12} /> {userHistory.length}
                    </span>
                    {userIncidents.length > 0 && (
                      <span className="flex items-center gap-1 text-rose-500 font-bold" title="Incidentes reportados">
                        <ShieldAlert size={12} /> {userIncidents.length}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditForm(user)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
                      title="Editar Perfil"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                      title="Eliminar Usuario"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold italic">
              No se encontraron usuarios que coincidan con la búsqueda.
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO AGREGAR / EDITAR */}
      {showAddForm && (
        <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} space-y-6 animate-in slide-in-from-bottom-6 duration-300`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-slate-200">
              {editingUser ? `Editar Usuario: ${editingUser.name}` : 'Registrar Nuevo Usuario'}
            </h3>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setEditingUser(null);
              }}
              aria-label="Cerrar formulario"
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DATOS BÁSICOS */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase">Documento ID / Cédula *</label>
                <input 
                  type="text" 
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={!!editingUser}
                  placeholder="Ej: 10203040"
                  className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 disabled:bg-slate-950/50' : 'bg-white border-gray-200 disabled:bg-gray-100'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase">Nombre Completo *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos Mario Restrepo"
                  className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase">Teléfono Celular</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 3115551234"
                  className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase">Centro Complejo</label>
                  <select
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="CTM">CTM</option>
                    <option value="CUERO">CUERO</option>
                    <option value="CONFECCIONES">CONFECCIONES</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase">Placas Vehículos (Separar por Comas)</label>
                  <input 
                    type="text" 
                    value={platesInput}
                    onChange={(e) => setPlatesInput(e.target.value)}
                    placeholder="Ej: ABC123, MOT999"
                    className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
              </div>

              {/* SELECCIÓN MÚLTIPLE DE ROLES */}
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase block mb-2">Roles del Usuario (Seleccionar todos los que apliquen)</label>
                <div className="flex flex-wrap gap-3">
                  {['Estudiante', 'Instructor', 'Administrativo'].map(role => {
                    const active = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${
                          active 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                            : 'border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {active && <Check size={14} />}
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PARQUEADERO ESPECIAL / RESERVADO */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-800 cursor-pointer hover:bg-slate-800/30 transition-all">
                  <input 
                    type="checkbox" 
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500" 
                  />
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-tight">Requiere Parqueadero Especial / Reserva</p>
                    <p className="text-[10px] text-slate-500 font-medium">Asignar reserva directiva o acceso preferencial</p>
                  </div>
                </label>

                {isSpecial && (
                  <input 
                    type="text" 
                    value={specialReason}
                    onChange={(e) => setSpecialReason(e.target.value)}
                    placeholder="Escriba el motivo (Ej: Discapacidad física, Directivo CTM)"
                    className={`w-full mt-2 p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 animate-in slide-in-from-top-2 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    }`}
                  />
                )}
              </div>
            </div>

            {/* ACTIVOS Y DISPOSITIVOS REGISTRADOS */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-wider">Equipos y Activos Registrados</h4>
                
                {/* Listado */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Laptop size={16} className="text-slate-500" />
                        <div>
                          <p className="font-bold text-slate-200">{asset.name}</p>
                          <p className="font-mono text-[10px] text-emerald-400 font-semibold">{asset.serial}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Eliminar activo"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {userAssets.length === 0 && (
                    <p className="text-slate-600 text-xs italic py-4 text-center">No hay activos registrados para este usuario.</p>
                  )}
                </div>

                {/* Formulario rápido para añadir */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pre-registrar Nuevo Activo</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="Tipo (Portátil Dell, etc)"
                      value={newAssetLabel}
                      onChange={(e) => setNewAssetLabel(e.target.value)}
                      className={`p-2.5 rounded-lg border outline-none focus:border-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}
                    />
                    <input 
                      type="text" 
                      placeholder="Serial del Equipo"
                      value={newAssetSerial}
                      onChange={(e) => setNewAssetSerial(e.target.value)}
                      className={`p-2.5 rounded-lg border outline-none focus:border-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="w-full py-2 bg-slate-800 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-bold uppercase rounded-lg transition-all"
                  >
                    Añadir Activo a Lista
                  </button>
                </div>
              </div>

              {/* HISTORIAL E INCIDENTES DEL USUARIO (SI SE EDITA) */}
              {editingUser && (
                <div className="p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Estadísticas e Incidentes</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold text-center">
                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-slate-200">
                        {history.filter(h => h.driverId === editingUser.id).length}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1">Visitas Completadas</p>
                    </div>
                    <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                      <p className="text-2xl font-black text-rose-500">
                        {incidents.filter(i => i.targetValue === editingUser.id || editingUser.plates.includes(i.targetValue)).length}
                      </p>
                      <p className="text-[9px] text-rose-400 uppercase mt-1">Incidentes Activos</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* BOTONES DE GUARDAR / CANCELAR */}
          <div className="flex gap-4 border-t border-slate-800 pt-6">
            <button
              onClick={handleSaveUser}
              className="flex-grow py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg"
            >
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingUser(null);
              }}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersView;
