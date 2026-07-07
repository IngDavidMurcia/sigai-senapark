import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Car, Bike, UserCheck, ShieldAlert, 
  Moon, Sun, Laptop, Map as MapIcon, FileBarChart, Settings, 
  Clock, Phone, X, Building2, HelpCircle
} from 'lucide-react';

// Importar datos iniciales
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_INCIDENTS, generateInitialSpots } from './mockData';

// Importar sub-componentes de vistas
import DashboardView from './components/DashboardView';
import MapView from './components/MapView';
import UsersView from './components/UsersView';
import AssetsView from './components/AssetsView';
import IncidentsView from './components/IncidentsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

const SmartParkApp = () => {
  // --- CARGA DE ESTADOS DESDE LOCALSTORAGE O MOCKDATA ---
  const [darkMode, setDarkMode] = useState(() => {
    const val = localStorage.getItem('senapark_darkmode');
    return val !== null ? JSON.parse(val) : true;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [plateInput, setPlateInput] = useState('');
  
  const [activeOperator, setActiveOperator] = useState(() => {
    return localStorage.getItem('senapark_operator') || 'Vigilante Portería Complejo';
  });

  const [globalCapacities, setGlobalCapacities] = useState(() => {
    const val = localStorage.getItem('senapark_capacities');
    return val ? JSON.parse(val) : { Carros: 50, Motos: 120, Bicis: 30 };
  });

  const [users, setUsers] = useState(() => {
    const val = localStorage.getItem('senapark_users');
    return val ? JSON.parse(val) : INITIAL_USERS;
  });

  const [vehicles, setVehicles] = useState(() => {
    const val = localStorage.getItem('senapark_vehicles');
    return val ? JSON.parse(val) : INITIAL_VEHICLES;
  });

  const [incidents, setIncidents] = useState(() => {
    const val = localStorage.getItem('senapark_incidents');
    return val ? JSON.parse(val) : INITIAL_INCIDENTS;
  });

  const [logs, setLogs] = useState(() => {
    const val = localStorage.getItem('senapark_logs');
    return val ? JSON.parse(val) : [];
  });

  const [history, setHistory] = useState(() => {
    const val = localStorage.getItem('senapark_history');
    return val ? JSON.parse(val) : [];
  });

  const [parkingSpots, setParkingSpots] = useState(() => {
    const val = localStorage.getItem('senapark_parkingspots');
    return val ? JSON.parse(val) : generateInitialSpots();
  });

  // Modal global de emergencia
  const [emergencyModalData, setEmergencyModalData] = useState(null);

  // --- ESCRIBIR CAMBIOS A LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('senapark_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('senapark_operator', activeOperator);
  }, [activeOperator]);

  useEffect(() => {
    localStorage.setItem('senapark_capacities', JSON.stringify(globalCapacities));
  }, [globalCapacities]);

  useEffect(() => {
    localStorage.setItem('senapark_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('senapark_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('senapark_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('senapark_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('senapark_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('senapark_parkingspots', JSON.stringify(parkingSpots));
  }, [parkingSpots]);


  // --- ACCIONES DE REGISTRO EN PLANTA Y OCUPACIÓN DE CUPOS ---

  // Entrada
  const handleRegister = (entryData) => {
    // Generar un ID único robusto
    const entryId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const entryWithId = { ...entryData, id: entryId };

    // 1. Agregar el vehículo a logs
    setLogs(prevLogs => [entryWithId, ...prevLogs]);

    // 2. Ocupar el cupo asignado en el mapa
    if (entryData.assignedSpotId) {
      setParkingSpots(prevSpots => prevSpots.map(spot => {
        if (spot.id === entryData.assignedSpotId) {
          return {
            ...spot,
            status: 'ocupado',
            occupiedBy: {
              plate: entryData.plate,
              driverName: entryData.driverName,
              entryTime: entryData.entryTime,
              center: entryData.center
            }
          };
        }
        return spot;
      }));
    }
  };

  // Salida
  const handleExit = (logId) => {
    const logToExit = logs.find(l => l.id === logId);
    if (!logToExit) return;

    const exitTime = new Date();
    const duration = Math.round((exitTime - new Date(logToExit.entryTime)) / 60000); // minutos

    // 1. Eliminar de logs y agregar a historial
    setLogs(prevLogs => prevLogs.filter(l => l.id !== logId));
    setHistory(prevHistory => [{ ...logToExit, exitTime, duration }, ...prevHistory]);

    // 2. Liberar cupo en el mapa (buscando por ID de cupo asignado o por placa por redundancia)
    if (logToExit.assignedSpotId || logToExit.plate) {
      setParkingSpots(prevSpots => prevSpots.map(spot => {
        if (
          (logToExit.assignedSpotId && spot.id === logToExit.assignedSpotId) || 
          (logToExit.plate && spot.occupiedBy && spot.occupiedBy.plate === logToExit.plate)
        ) {
          return {
            ...spot,
            status: 'libre',
            occupiedBy: null
          };
        }
        return spot;
      }));
    }
  };

  // Restablecer valores de demostración
  const handleResetToMockData = () => {
    localStorage.removeItem('senapark_users');
    localStorage.removeItem('senapark_vehicles');
    localStorage.removeItem('senapark_incidents');
    localStorage.removeItem('senapark_logs');
    localStorage.removeItem('senapark_history');
    localStorage.removeItem('senapark_parkingspots');
    localStorage.removeItem('senapark_operator');
    localStorage.removeItem('senapark_capacities');
  };

  // Limpiar toda la BBDD
  const handleWipeAllData = () => {
    localStorage.clear();
  };

  // Abre el modal de emergencia con los datos extendidos del conductor/vehículo
  const handleOpenEmergencyModal = (data) => {
    // Si pasamos un log, podemos resolver su información extendida en la DB
    const driverId = data.driverId || data.ownerId;
    const owner = users.find(u => u.id === driverId);
    const userPhone = owner ? owner.phone : (data.driverPhone || 'No registrado');
    const userRoles = owner ? owner.roles.join(', ') : (data.driverRole || data.type || 'Visitante');
    
    // Obtener incidentes activos
    const userIncidents = incidents.filter(i => 
      (i.targetType === 'user' && i.targetValue === driverId) || 
      (i.targetType === 'vehicle' && i.targetValue === data.plate)
    );

    // Obtener lista de activos
    const userAssets = data.assets || [];

    setEmergencyModalData({
      plate: data.plate,
      driverName: data.driverName || data.name || 'Desconocido',
      driverPhone: userPhone,
      driverRole: userRoles,
      center: data.center || 'No especificado',
      assets: userAssets,
      incidents: userIncidents
    });
  };

  // --- ESTADÍSTICAS DEL COMPLEJO ---
  const stats = useMemo(() => {
    const totalSpots = parkingSpots.length;
    
    // Calcular por tipo
    const carSpots = parkingSpots.filter(s => s.vehicleType === 'Carro');
    const motoSpots = parkingSpots.filter(s => s.vehicleType === 'Moto');
    const biciSpots = parkingSpots.filter(s => s.vehicleType === 'Bici');

    return {
      Carros: { 
        occupied: carSpots.filter(s => s.status === 'ocupado').length, 
        total: globalCapacities.Carros 
      },
      Motos: { 
        occupied: motoSpots.filter(s => s.status === 'ocupado').length, 
        total: globalCapacities.Motos 
      },
      Bicis: { 
        occupied: biciSpots.filter(s => s.status === 'ocupado').length, 
        total: globalCapacities.Bicis 
      },
      Visitantes: { 
        occupied: logs.filter(l => l.driverRole === 'Visitante').length, 
        total: 20 
      }
    };
  }, [parkingSpots, logs, globalCapacities]);

  return (
    <div className={`${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'
    } min-h-screen transition-colors duration-300 font-sans`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 h-full w-64 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'
      } border-r z-20 transition-all duration-300`}>
        <div className="p-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent italic tracking-tighter uppercase">
            SENA PARK
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Control de Complejo
          </p>
        </div>
        
        <nav className="mt-6 px-4 space-y-1.5">
          {[
            { id: 'dashboard', label: 'Portería', icon: <LayoutDashboard size={18}/> },
            { id: 'map', label: 'Mapa General', icon: <MapIcon size={18}/> },
            { id: 'users', label: 'Usuarios / Roles', icon: <UserCheck size={18}/> },
            { id: 'assets', label: 'Activos / Equipos', icon: <Laptop size={18}/> },
            { id: 'incidents', label: 'Incidentes', icon: <ShieldAlert size={18}/> },
            { id: 'reports', label: 'Estadísticas', icon: <FileBarChart size={18}/> },
            { id: 'settings', label: 'Ajustes Complejo', icon: <Settings size={18}/> },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 scale-102' 
                  : 'text-slate-500 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              {item.icon} 
              <span className="text-xs uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-medium">
          <p className="font-extrabold uppercase text-slate-400 tracking-wider">Complejo Activo:</p>
          <p className="mt-0.5">CTM - CUERO - CONFECCIONES</p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="ml-64 p-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-800/40 pb-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">
              {activeTab === 'dashboard' ? 'Panel de Portería' : 
               activeTab === 'map' ? 'Mapa de Ocupación' : 
               activeTab === 'users' ? 'Gestión de Usuarios' : 
               activeTab === 'assets' ? 'Control de Activos' : 
               activeTab === 'incidents' ? 'Reporte de Novedades' : 
               activeTab === 'reports' ? 'Auditoría y Reportes' : 
               'Configuración General'}
            </h2>
            <div className="flex items-center text-xs font-bold text-slate-500 uppercase gap-2 mt-1">
              <Clock size={14} /> 
              <span>Vigilancia Online</span>
              <span>•</span>
              <span className="text-emerald-500 font-extrabold">Operador: {activeOperator}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              aria-label="Alternar modo oscuro"
              className={`p-3 rounded-full transition-all ${
                darkMode ? 'bg-slate-900 text-yellow-400 border border-slate-800' : 'bg-white shadow-md text-slate-600'
              }`}
            >
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className={`px-4 py-2 rounded-xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'
            } flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider`}>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Portería A</span>
            </div>
          </div>
        </header>

        {/* CONTENEDOR DE RENDERS */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && (
            <DashboardView 
              darkMode={darkMode}
              plateInput={plateInput}
              setPlateInput={setPlateInput}
              logs={logs}
              users={users}
              vehicles={vehicles}
              incidents={incidents}
              parkingSpots={parkingSpots}
              handleRegister={handleRegister}
              handleExit={handleExit}
              onOpenEmergencyModal={handleOpenEmergencyModal}
            />
          )}

          {activeTab === 'map' && (
            <MapView 
              darkMode={darkMode}
              parkingSpots={parkingSpots}
              setParkingSpots={setParkingSpots}
              logs={logs}
              onOpenEmergencyModal={handleOpenEmergencyModal}
            />
          )}

          {activeTab === 'users' && (
            <UsersView 
              darkMode={darkMode}
              users={users}
              setUsers={setUsers}
              vehicles={vehicles}
              setVehicles={setVehicles}
              history={history}
              incidents={incidents}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsView 
              darkMode={darkMode}
              users={users}
              logs={logs}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView 
              darkMode={darkMode}
              incidents={incidents}
              setIncidents={setIncidents}
              users={users}
              vehicles={vehicles}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              darkMode={darkMode}
              history={history}
              logs={logs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              darkMode={darkMode}
              activeOperator={activeOperator}
              setActiveOperator={setActiveOperator}
              globalCapacities={globalCapacities}
              setGlobalCapacities={setGlobalCapacities}
              onResetToMockData={handleResetToMockData}
              onWipeAllData={handleWipeAllData}
            />
          )}
        </div>
      </main>

      {/* MODAL GLOBAL DE CONTACTO Y EMERGENCIA */}
      {emergencyModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-2xl font-black font-mono text-emerald-400 tracking-tighter">
                  {emergencyModalData.plate}
                </h4>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  Ficha de Localización Rápida
                </p>
              </div>
              <button 
                onClick={() => setEmergencyModalData(null)}
                aria-label="Cerrar ficha de emergencia"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* CONDUCTOR */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Conductor Activo</p>
                <p className="text-lg font-extrabold text-slate-200">{emergencyModalData.driverName}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 uppercase font-bold mt-1">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-350">{emergencyModalData.driverRole}</span>
                  <span>•</span>
                  <span>Destino: <span className="text-emerald-400">{emergencyModalData.center}</span></span>
                </p>
              </div>

              {/* TELÉFONO DE CONTACTO */}
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <Phone className="text-emerald-400 shrink-0" size={20} />
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Número de Celular</p>
                    <p className="text-md font-mono font-black text-slate-200">{emergencyModalData.driverPhone}</p>
                  </div>
                </div>
                <a 
                  href={`tel:${emergencyModalData.driverPhone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-sm shadow-emerald-900/20"
                >
                  Llamar
                </a>
              </div>

              {/* EQUIPOS DECLARADOS */}
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Equipos Declarádos al Ingreso</p>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {emergencyModalData.assets.map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                      <span className="text-slate-300 font-medium">{asset.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">{asset.serial}</span>
                    </div>
                  ))}
                  {emergencyModalData.assets.length === 0 && (
                    <p className="text-slate-600 text-xs italic">Ningún activo registrado en esta visita.</p>
                  )}
                </div>
              </div>

              {/* REPORTES DE TRÁNSITO / VELOCIDAD */}
              {emergencyModalData.incidents.length > 0 && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-2">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Reportes de Comportamiento Activos
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {emergencyModalData.incidents.map((inc, i) => (
                      <div key={i} className="text-xs text-rose-300 leading-tight">
                        <span className="font-black">[{inc.type}]:</span> {inc.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setEmergencyModalData(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold text-xs uppercase transition-all"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SmartParkApp;