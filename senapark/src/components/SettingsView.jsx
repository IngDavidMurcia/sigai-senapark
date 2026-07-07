import React, { useState } from 'react';
import {
  Settings, UserCheck, ShieldAlert, RotateCcw, Trash2, Cpu, Info, CheckCircle
} from 'lucide-react';

const SettingsView = ({
  darkMode,
  activeOperator,
  setActiveOperator,
  globalCapacities,
  setGlobalCapacities,
  onResetToMockData,
  onWipeAllData
}) => {
  const [operatorInput, setOperatorInput] = useState(activeOperator);
  const [carLimit, setCarLimit] = useState(globalCapacities.Carros || 50);
  const [motoLimit, setMotoLimit] = useState(globalCapacities.Motos || 120);
  const [biciLimit, setBiciLimit] = useState(globalCapacities.Bicis || 30);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    setActiveOperator(operatorInput);

    const updatedCapacities = {
      Carros: parseInt(carLimit) || 0,
      Motos: parseInt(motoLimit) || 0,
      Bicis: parseInt(biciLimit) || 0
    };
    setGlobalCapacities(updatedCapacities);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm("¿Estás seguro de restaurar el sistema a los datos de fábrica? Perderás todos los registros creados hoy.")) {
      onResetToMockData();
      alert("Base de datos simulada restaurada.");
      window.location.reload();
    }
  };

  const handleWipeData = () => {
    if (confirm("¿Estás seguro de ELIMINAR COMPLETAMENTE todos los datos de la aplicación? Esto borrará logs, usuarios y vehículos permanentemente.")) {
      onWipeAllData();
      alert("Todos los datos han sido borrados.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">

      {/* SECCIÓN GENERAL: OPERADOR Y CAPACIDADES */}
      <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        } space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Settings className="text-emerald-500" size={24} />
          <h3 className="text-xl font-extrabold text-slate-200">Ajustes Generales</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OPERADOR ACTIVO */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1.5">
              <UserCheck size={14} /> Operador de Turno (Portería)
            </label>
            <input
              type="text"
              value={operatorInput}
              onChange={(e) => setOperatorInput(e.target.value)}
              placeholder="Ej: Vigilante Carlos Restrepo"
              className={`w-full p-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
                }`}
            />
            <p className="text-[10px] text-slate-500 font-medium">Este nombre auditará cada registro de entrada y salida.</p>
          </div>

          {/* CAPACIDADES MÁXIMAS */}
          <div className="space-y-4">
            <label className="text-[10px] text-slate-500 font-black uppercase block">
              Capacidad Máxima de Cupos
            </label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[9px] text-slate-500 font-bold block mb-1">Carros</span>
                <input
                  type="number"
                  value={carLimit}
                  onChange={(e) => setCarLimit(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none text-center focus:border-emerald-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'
                    }`}
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block mb-1">Motos</span>
                <input
                  type="number"
                  value={motoLimit}
                  onChange={(e) => setMotoLimit(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none text-center focus:border-emerald-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'
                    }`}
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block mb-1">Bicicletas</span>
                <input
                  type="number"
                  value={biciLimit}
                  onChange={(e) => setBiciLimit(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none text-center focus:border-emerald-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
          >
            Guardar Configuración
          </button>
          {saveSuccess && (
            <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5 animate-in fade-in duration-300">
              <CheckCircle size={16} /> ¡Configuración guardada!
            </span>
          )}
        </div>
      </div>

      {/* SECCIÓN MANTENIMIENTO: REINICIAR / LIMPIAR */}
      <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        } space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <ShieldAlert className="text-orange-500" size={24} />
          <h3 className="text-xl font-extrabold text-slate-200">Mantenimiento de Base de Datos</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          El prototipo de SENA Park almacena la información de manera segura y privada en el navegador web local.
          Puedes utilizar estas utilidades para administrar los datos de prueba durante las demostraciones.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* RESET MOCK DATA */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/30 flex flex-col justify-between items-start gap-4">
            <div>
              <h4 className="font-extrabold text-slate-200 text-sm uppercase flex items-center gap-2">
                <RotateCcw size={16} className="text-orange-400" /> Restablecer Datos de Demostración
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Sobrescribe los datos locales con la semilla inicial (estudiantes, instructores de prueba, incidentes y activos).
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg border border-orange-500/20 hover:border-orange-500 text-xs font-bold uppercase transition-all"
            >
              Cargar Semilla Demo
            </button>
          </div>

          {/* WIPE DATA */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/30 flex flex-col justify-between items-start gap-4">
            <div>
              <h4 className="font-extrabold text-slate-200 text-sm uppercase flex items-center gap-2">
                <Trash2 size={16} className="text-rose-500" /> Limpieza Total de Datos
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Borra permanentemente toda la información del parqueadero. Útil para iniciar pruebas reales desde cero.
              </p>
            </div>
            <button
              onClick={handleWipeData}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-500/20 hover:border-rose-500 text-xs font-bold uppercase transition-all"
            >
              Borrar Todo
            </button>
          </div>
        </div>
      </div>

      {/* DETALLES DE COMPLEJO / INFORMACIÓN APP */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-600'
        } flex items-start gap-4 text-xs`}>
        <Info size={22} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold uppercase text-slate-350 tracking-wider">Acerca de SENA Park v1.0.0</p>
          <p>
            Este software fue diseñado para el control de porterías y se encuentra en fase de pruebas piloto, nos permite el control de activos y optimización del flujo vehicular
            en el SENA Complejo Sur. Todo el almacenamiento es local al navegador por fines de portabilidad, independencia y test iniciales.
          </p>
          <p className="text-[10px] text-slate-500">SENA Complejo Sur: CTM - CUERO - CONFECCIONES - OTROS</p>
          <p className="text-[10px] text-slate-500">Desarrollador: David Murcia - Tecnoacademia CTM</p>
        </div>
      </div>

    </div>
  );
};

export default SettingsView;
