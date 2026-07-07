import React, { useState } from 'react';
import { 
  FileBarChart, Search, Download, Clock, Calendar, BarChart2, ListFilter, Users, Building2
} from 'lucide-react';

const ReportsView = ({ 
  darkMode, 
  history, 
  logs 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [centerFilter, setCenterFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const totalVisits = history.length;
  const currentInside = logs.length;
  
  // Calcular promedios de permanencia
  const avgDuration = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (curr.duration || 0), 0) / history.length)
    : 0;

  // Distribución por Centro (En Planta + Historial)
  const allEntries = [...logs, ...history];
  const centerCounts = { CTM: 0, CUERO: 0, CONFECCIONES: 0, OTRO: 0 };
  allEntries.forEach(e => {
    if (centerCounts[e.center] !== undefined) {
      centerCounts[e.center]++;
    }
  });

  // Distribución por Tipo de Usuario
  const roleCounts = { Estudiante: 0, Instructor: 0, Administrativo: 0, Visitante: 0 };
  allEntries.forEach(e => {
    const role = e.driverRole || e.type;
    if (roleCounts[role] !== undefined) {
      roleCounts[role]++;
    }
  });

  // Historial filtrado
  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      item.plate.toLowerCase().includes(term) ||
      item.driverName.toLowerCase().includes(term) ||
      (item.driverId && item.driverId.toLowerCase().includes(term))
    );

    const matchesCenter = centerFilter === 'ALL' || item.center === centerFilter;
    const matchesRole = roleFilter === 'ALL' || item.driverRole === roleFilter;

    return matchesSearch && matchesCenter && matchesRole;
  });

  // --- LÓGICA DE EXPORTACIÓN A CSV ---
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      alert("No hay registros en el historial para exportar.");
      return;
    }

    // Cabeceras
    let csvContent = "Placa,Conductor,ID Conductor,Rol,Centro,Fecha Entrada,Hora Entrada,Fecha Salida,Hora Salida,Duracion (Minutos),Equipos\n";
    
    // Contenido
    filteredHistory.forEach(item => {
      const entryDateObj = new Date(item.entryTime);
      const exitDateObj = new Date(item.exitTime);
      const entryDate = entryDateObj.toLocaleDateString();
      const entryTime = entryDateObj.toLocaleTimeString();
      const exitDate = exitDateObj.toLocaleDateString();
      const exitTime = exitDateObj.toLocaleTimeString();
      const assetsList = (item.assets || []).map(a => `${a.name}(${a.serial})`).join(' | ');
      
      csvContent += `"${item.plate || 'PEATÓN'}","${item.driverName}","${item.driverId || ''}","${item.driverRole}","${item.center}","${entryDate}","${entryTime}","${exitDate}","${exitTime}",${item.duration || 0},"${assetsList}"\n`;
    });

    // Descarga real de archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sena_park_reporte_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulación de Distribución Horaria (Horas Pico - Pure CSS Bars)
  const mockHourlyStats = [
    { label: "6am-8am", count: 42, pct: 85, color: "bg-emerald-500" },
    { label: "8am-12pm", count: 28, pct: 55, color: "bg-blue-500" },
    { label: "12pm-2pm", count: 35, pct: 70, color: "bg-purple-500" },
    { label: "2pm-6pm", count: 18, pct: 35, color: "bg-orange-500" },
    { label: "6pm-10pm", count: 48, pct: 95, color: "bg-rose-500" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* DASHBOARD DE MÉTRICAS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* TOTAL ENTRADAS */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Historial Salidas</span>
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
              <Calendar size={16} />
            </div>
          </div>
          <h3 className="text-4xl font-black">{totalVisits}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Registros finalizados hoy</p>
        </div>

        {/* ACTIVOS ADENTRO */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Activos en Complejo</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Users size={16} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-emerald-400">{currentInside}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Vehículos parqueados actualmente</p>
        </div>

        {/* TIEMPO PROMEDIO */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tiempo Promedio</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-blue-400">
            {avgDuration} <span className="text-lg font-bold text-slate-500">Min</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Permanencia estimada por vehículo</p>
        </div>

        {/* CAPACIDAD OCUPADA ESTIMADA */}
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tasa Ocupación</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <BarChart2 size={16} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-purple-400">
            {logs.length > 0 ? Math.round((logs.length / 185) * 100) : 0}%
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Capacidad general ocupada</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* DISTRIBUCIÓN POR CENTRO Y ROLES (Gráficos Interactivos CSS) */}
        <div className={`p-8 rounded-3xl border lg:col-span-1 space-y-8 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tráfico por Centro Complejo</h4>
            <div className="space-y-3.5">
              {Object.entries(centerCounts).map(([cnt, val]) => {
                const total = Object.values(centerCounts).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((val / total) * 100);
                return (
                  <div key={cnt} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-350">
                      <span>{cnt === 'OTRO' ? 'Otros Destinos' : `Centro ${cnt}`}</span>
                      <span>{val} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Distribución de Roles</h4>
            <div className="space-y-3.5">
              {Object.entries(roleCounts).map(([role, val]) => {
                const total = Object.values(roleCounts).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((val / total) * 100);
                return (
                  <div key={role} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-350">
                      <span>{role}</span>
                      <span>{val} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRÁFICO HORAS PICO */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Flujo de Horas Pico (Estimado)</h4>
            <div className="flex items-end justify-between h-36 pt-4 px-2">
              {mockHourlyStats.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>
                  <div 
                    className={`w-7 rounded-t-lg transition-all duration-1000 ${item.color} group-hover:brightness-110`}
                    style={{ height: `${item.pct}%` }}
                  ></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLA HISTORIAL DE SALIDAS */}
        <div className={`p-8 rounded-3xl border lg:col-span-2 space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Historial de Visitas</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vehículos que han salido hoy</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-lg flex items-center gap-1.5"
            >
              <Download size={14} /> Exportar CSV / Excel
            </button>
          </div>

          {/* FILTROS INTERNOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Placa o conductor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none border focus:border-blue-500 ${
                  darkMode ? 'bg-slate-850 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'
                }`}
              />
            </div>

            <select 
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className={`p-2 rounded-lg text-xs outline-none border focus:border-blue-500 ${
                darkMode ? 'bg-slate-850 border-slate-800 text-slate-300' : 'bg-white'
              }`}
            >
              <option value="ALL">Todos los Centros</option>
              <option value="CTM">CDTI / CTM</option>
              <option value="CUERO">CUERO</option>
              <option value="CONFECCIONES">CONFECCIONES</option>
              <option value="OTRO">OTRO</option>
            </select>

            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`p-2 rounded-lg text-xs outline-none border focus:border-blue-500 ${
                darkMode ? 'bg-slate-850 border-slate-800 text-slate-300' : 'bg-white'
              }`}
            >
              <option value="ALL">Todos los Roles</option>
              <option value="Estudiante">Estudiantes</option>
              <option value="Instructor">Instructores</option>
              <option value="Administrativo">Administrativos</option>
              <option value="Visitante">Visitantes</option>
            </select>
          </div>

          {/* LISTA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                  <th className="pb-3">Placa / Tipo</th>
                  <th className="pb-3">Persona / Destino</th>
                  <th className="pb-3 text-right">Duración</th>
                  <th className="pb-3 text-right">Ingreso</th>
                  <th className="pb-3 text-right">Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-850/30 transition-all text-xs">
                    
                    {/* PLACA */}
                    <td className="py-3">
                      {item.plate ? (
                        <span className="font-mono font-black text-emerald-400 tracking-tighter text-md block">
                          {item.plate}
                        </span>
                      ) : (
                        <span className="font-mono font-black text-orange-400 tracking-tighter text-md block">
                          PEATÓN
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        {item.vehicleType}
                      </span>
                    </td>

                    {/* CONDUCTOR */}
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200 group-hover:text-white">
                          {item.driverName}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                          <span>{item.driverRole}</span>
                          <span>•</span>
                          <span className="text-emerald-500">{item.center}</span>
                        </span>
                      </div>
                    </td>

                    {/* DURACIÓN */}
                    <td className="py-3 text-right font-bold text-slate-300">
                      {item.duration || 0} min
                    </td>

                    {/* HORA INGRESO */}
                    <td className="py-3 text-right text-slate-400 font-mono font-bold">
                      <div className="flex flex-col">
                        <span className="text-[10px]">{new Date(item.entryTime).toLocaleDateString()}</span>
                        <span>{new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    {/* HORA SALIDA */}
                    <td className="py-3 text-right text-slate-400 font-mono font-bold">
                      <div className="flex flex-col">
                        <span className="text-[10px]">{new Date(item.exitTime).toLocaleDateString()}</span>
                        <span>{new Date(item.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-500 font-bold italic">
                      No hay salidas registradas con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReportsView;
