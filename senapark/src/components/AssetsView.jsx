import React, { useState } from 'react';
import { 
  Laptop, Search, ShieldAlert, ArrowRight, User
} from 'lucide-react';

const AssetsView = ({ 
  darkMode, 
  users, 
  logs 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, IN, OUT

  // Aplanar todos los activos registrados de todos los usuarios
  const allRegisteredAssets = [];
  users.forEach(user => {
    if (user.assets && user.assets.length > 0) {
      user.assets.forEach(asset => {
        // Verificar si está actualmente adentro
        // Un activo está adentro si está en la lista de activos de algún vehículo en planta
        const isAssetInside = logs.some(log => 
          log.assets && log.assets.some(la => la.id === asset.id || la.serial === asset.serial)
        );

        // Encontrar en qué registro/placa está si está adentro
        const activeLog = logs.find(log => 
          log.assets && log.assets.some(la => la.id === asset.id || la.serial === asset.serial)
        );

        allRegisteredAssets.push({
          ...asset,
          owner: {
            id: user.id,
            name: user.name,
            center: user.center,
            phone: user.phone
          },
          isInside: isAssetInside,
          activeEntry: activeLog || null
        });
      });
    }
  });

  // Agregar activos que entraron "al vuelo" de visitantes o usuarios (activos dinámicos temporales)
  logs.forEach(log => {
    if (log.assets && log.assets.length > 0) {
      log.assets.forEach(asset => {
        // Si no está ya registrado como activo pre-existente, lo agregamos como dinámico
        const exists = allRegisteredAssets.some(a => a.serial === asset.serial || a.id === asset.id);
        if (!exists) {
          allRegisteredAssets.push({
            id: asset.id,
            name: asset.name,
            serial: asset.serial,
            owner: {
              id: log.driverId,
              name: log.driverName,
              center: log.center,
              phone: log.driverPhone
            },
            isInside: true,
            activeEntry: log,
            isDynamic: true // Ingresado en portería
          });
        }
      });
    }
  });

  // Filtrado de activos
  const filteredAssets = allRegisteredAssets.filter(asset => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      asset.name.toLowerCase().includes(term) ||
      asset.serial.toLowerCase().includes(term) ||
      asset.owner.name.toLowerCase().includes(term) ||
      asset.owner.id.includes(term)
    );

    const matchesStatus = (
      statusFilter === 'ALL' ||
      (statusFilter === 'IN' && asset.isInside) ||
      (statusFilter === 'OUT' && !asset.isInside)
    );

    return matchesSearch && matchesStatus;
  });

  // Contadores
  const totalAssets = allRegisteredAssets.length;
  const assetsInside = allRegisteredAssets.filter(a => a.isInside).length;
  const assetsOutside = totalAssets - assetsInside;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* TARJETAS ESTADÍSTICAS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL ACTIVOS */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Inventario</span>
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
              <Laptop size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black">{totalAssets}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Equipos tecnológicos registrados</p>
        </div>

        {/* ACTIVOS EN COMPLEJO */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">En Complejo (Activos)</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Laptop size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-blue-400">{assetsInside}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Equipos dentro de las instalaciones</p>
        </div>

        {/* ACTIVOS AFUERA */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Fuera de Complejo</span>
            <div className="p-2 bg-slate-800 rounded-lg text-slate-500">
              <Laptop size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-400">{assetsOutside}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Equipos fuera de planta</p>
        </div>

      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        {/* BUSCADOR */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Equipo, Serial o Dueño..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-slate-100' : 'bg-white border-gray-200 focus:border-emerald-500 text-slate-900'
            }`}
          />
        </div>

        {/* TABS DE ESTADO */}
        <div className="flex gap-2">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'IN', label: 'En Planta' },
            { id: 'OUT', label: 'Fuera' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-400' : 'bg-white border text-slate-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} overflow-x-auto`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="pb-4">Equipo / Dispositivo</th>
              <th className="pb-4">Serial</th>
              <th className="pb-4">Propietario / Centro</th>
              <th className="pb-4">Placa Ingreso</th>
              <th className="pb-4 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {filteredAssets.map(asset => (
              <tr key={asset.id} className="group hover:bg-slate-800/10 transition-all">
                
                {/* NOMBRE DEL EQUIPO */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Laptop className="text-slate-400 shrink-0" size={18} />
                    <div>
                      <span className="font-extrabold text-slate-200 group-hover:text-white block">
                        {asset.name}
                      </span>
                      {asset.isDynamic && (
                        <span className="text-[8px] bg-orange-500/20 border border-orange-500/30 text-orange-400 px-1.5 py-0.2 rounded font-black uppercase tracking-wide mt-0.5 inline-block">
                          Reg. en Portería (Visitante)
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* SERIAL */}
                <td className="py-4 text-xs font-mono font-bold text-slate-400">
                  {asset.serial}
                </td>

                {/* PROPIETARIO */}
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-300">
                      {asset.owner.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ID: {asset.owner.id} | Centro: <span className="text-emerald-500 font-bold">{asset.owner.center}</span>
                    </span>
                  </div>
                </td>

                {/* VEHÍCULO DE INGRESO */}
                <td className="py-4">
                  {asset.isInside && asset.activeEntry ? (
                    <span className="font-mono font-black text-emerald-400 tracking-tighter text-md">
                      {asset.activeEntry.plate}
                    </span>
                  ) : (
                    <span className="text-slate-700 font-bold">-</span>
                  )}
                </td>

                {/* ESTADO */}
                <td className="py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    asset.isInside 
                      ? 'bg-blue-500/15 border-blue-500/20 text-blue-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {asset.isInside ? 'En Complejo' : 'Fuera'}
                  </span>
                </td>

              </tr>
            ))}

            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 font-bold italic">
                  No se encontraron activos registrados en este listado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AssetsView;
