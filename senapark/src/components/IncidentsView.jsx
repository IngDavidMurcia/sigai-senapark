import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Plus, Search, Trash2, CheckCircle, Clock
} from 'lucide-react';

const IncidentsView = ({ 
  darkMode, 
  incidents, 
  setIncidents, 
  users, 
  vehicles 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Control de Formulario
  const [showAddForm, setShowAddForm] = useState(false);

  // Estados del nuevo reporte
  const [targetType, setTargetType] = useState('vehicle'); // vehicle, user
  const [targetValue, setTargetValue] = useState('');
  const [incidentType, setIncidentType] = useState('Exceso Velocidad');
  const [severity, setSeverity] = useState('Yellow'); // Yellow, Red
  const [description, setDescription] = useState('');

  // Lógica para registrar incidente
  const handleAddIncident = () => {
    const value = targetValue.trim().toUpperCase();
    if (!value || !description) {
      alert("Por favor completa los campos obligatorios: ID/Placa y Descripción.");
      return;
    }

    // Validar existencia rápida
    if (targetType === 'vehicle') {
      const exists = vehicles.some(v => v.plate === value);
      if (!exists) {
        if (!confirm(`La placa ${value} no está registrada en el sistema. ¿Deseas reportar el incidente de todas formas (ej. para un visitante nuevo)?`)) {
          return;
        }
      }
    } else {
      const exists = users.some(u => u.id === value);
      if (!exists) {
        if (!confirm(`El ID de usuario ${value} no está registrado en el sistema. ¿Deseas reportar el incidente de todas formas (ej. para un visitante nuevo)?`)) {
          return;
        }
      }
    }

    const newIncident = {
      id: Date.now(),
      targetType,
      targetValue: value,
      type: incidentType,
      severity,
      description,
      date: new Date().toISOString().split('T')[0]
    };

    setIncidents([newIncident, ...incidents]);
    
    // Resetear formulario
    setTargetValue('');
    setDescription('');
    setShowAddForm(false);
  };

  // Resolver / Borrar incidente
  const handleResolveIncident = (incidentId) => {
    if (confirm("¿Marcar este incidente como RESUELTO? Dejará de mostrar advertencias en la portería.")) {
      setIncidents(incidents.filter(i => i.id !== incidentId));
    }
  };

  // Filtrado de incidentes
  const filteredIncidents = incidents.filter(inc => {
    const term = searchTerm.toLowerCase();
    return (
      inc.targetValue.toLowerCase().includes(term) ||
      inc.type.toLowerCase().includes(term) ||
      inc.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* CABECERA Y BUSCADOR */}
      {!showAddForm && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por placa, ID o tipo de reporte..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-slate-100' : 'bg-white border-gray-200 focus:border-emerald-500 text-slate-900'
              }`}
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={16} /> Reportar Incidente / Novedad
          </button>
        </div>
      )}

      {/* LISTADO DE REPORTES */}
      {!showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((inc) => (
            <div 
              key={inc.id}
              className={`p-6 rounded-3xl border transition-all hover:scale-[1.01] flex flex-col justify-between gap-5 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    inc.severity === 'Red'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 animate-pulse'
                      : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {inc.severity === 'Red' ? 'Sanción / Bloqueo' : 'Advertencia'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Clock size={12} /> {inc.date}
                  </span>
                </div>

                {/* Título Reporte */}
                <div>
                  <h4 className="font-extrabold text-slate-100 text-lg leading-tight uppercase">
                    {inc.type}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    ASOCIADO A {inc.targetType === 'vehicle' ? 'PLACA' : 'USUARIO ID'}:
                    <span className={`ml-1 font-mono font-black text-sm ${
                      inc.severity === 'Red' ? 'text-rose-400' : 'text-yellow-500'
                    }`}>
                      {inc.targetValue}
                    </span>
                  </p>
                </div>

                {/* Descripción */}
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {inc.description}
                </p>
              </div>

              {/* Botón Resolver */}
              <div className="pt-3 border-t border-slate-800/40 flex justify-end">
                <button
                  onClick={() => handleResolveIncident(inc.id)}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Resolver Infracción
                </button>
              </div>
            </div>
          ))}

          {filteredIncidents.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold italic">
              No hay incidentes ni sanciones vigentes en el sistema.
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO AGREGAR INCIDENTE */}
      {showAddForm && (
        <div className={`p-8 rounded-3xl border max-w-xl mx-auto ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        } space-y-6 animate-in slide-in-from-bottom-6 duration-300`}>
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-orange-500 flex items-center gap-2">
              <ShieldAlert size={24} /> Registrar Incidente Operativo
            </h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-slate-850 rounded-xl text-slate-400 transition-all text-xs font-bold"
            >
              Cerrar
            </button>
          </div>

          <div className="space-y-4">
            {/* TIPO DE ASOCIADO */}
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase block mb-1.5">
                Vincular Reporte a
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('vehicle');
                    setTargetValue('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all ${
                    targetType === 'vehicle'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  Placa de Vehículo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('user');
                    setTargetValue('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all ${
                    targetType === 'user'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  ID / Cédula de Conductor
                </button>
              </div>
            </div>

            {/* VALOR DE ASOCIADO */}
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase">
                {targetType === 'vehicle' ? 'Escribe la Placa del Vehículo *' : 'Escribe el ID / Cédula del Usuario *'}
              </label>
              <input 
                type="text" 
                placeholder={targetType === 'vehicle' ? 'ABC123' : '10203040'}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-orange-500 uppercase tracking-widest ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
                }`}
              />
            </div>

            {/* TIPO DE INFRACCIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase">Tipo de Novedad/Infracción</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-orange-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'
                  }`}
                >
                  <option value="Exceso Velocidad">Exceso de Velocidad</option>
                  <option value="Mal Parqueado">Vehículo Mal Parqueado</option>
                  <option value="Fuera de Area">Fuera de Áreas Delimitadas</option>
                  <option value="Bloqueo Talanquera">Bloqueo de Talanquera</option>
                  <option value="Otro">Otro Reporte / Comportamiento</option>
                </select>
              </div>

              {/* SEVERIDAD */}
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase block">Severidad de la Sanción</label>
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setSeverity('Yellow')}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all ${
                      severity === 'Yellow'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 font-black'
                        : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    Advertencia (Amarilla)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('Red')}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all ${
                      severity === 'Red'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-400 font-black'
                        : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    Bloqueo (Roja)
                  </button>
                </div>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase">Detalles del Suceso *</label>
              <textarea 
                rows="4"
                placeholder="Escribe la descripción de la novedad (Ej: Exceso de velocidad en portería peatonal, el conductor aceleró bruscamente en zona escolar...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full mt-1.5 p-3 rounded-xl border outline-none text-sm focus:border-orange-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
                }`}
              ></textarea>
            </div>

          </div>

          {/* BOTONES */}
          <div className="flex gap-4 border-t border-slate-800 pt-6">
            <button
              onClick={handleAddIncident}
              className="flex-grow py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg"
            >
              Registrar Reporte
            </button>
            <button
              onClick={() => setShowAddForm(false)}
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

export default IncidentsView;
