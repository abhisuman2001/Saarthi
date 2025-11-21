import { useState } from "react";
import logo from "../logo.png";

export default function InteractiveMockup() {
  const [active, setActive] = useState(0);

  const features = [
    {
      title: "Daily Reminders",
      desc: "Automated twice-daily reminders customizable by appliance type to reinforce wear behaviour.",
    },
    {
      title: "Feedback & Logs",
      desc: "Patients log appliance wear, comfort issues and photos — data feeds into the clinician dashboard.",
    },
    {
      title: "Doctor Dashboard",
      desc: "Quick patient summaries, adherence trends and messaging to support remote monitoring.",
    },
  ];

  return (
    <div className="px-6 md:px-0 flex justify-center">
      <div className="max-w-lg w-full bg-gradient-to-br from-cyan-100 to-white rounded-2xl shadow-lg p-6 transform transition-transform hover:-translate-y-1 overflow-visible">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Orthisaarhi"
            className="w-28 h-28 object-contain opacity-95 rounded-md shadow-md hover:scale-105 transition-transform"
            style={{ willChange: "transform" }}
          />
        </div>

        <div className="mt-4 bg-white rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {features.map((f, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full min-w-0 p-3 rounded text-left transition-colors duration-200 break-words ${
                  active === i ? "bg-cyan-50 ring-2 ring-cyan-200" : "bg-cyan-50/60 hover:bg-cyan-50"
                }`}
                aria-pressed={active === i}
              >
                <div className="text-sm font-medium text-gray-700">{f.title}</div>
                <div className="text-xs text-gray-500 mt-1 overflow-hidden" style={{maxHeight: 36}}>{f.desc}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 bg-gray-50 rounded p-4 overflow-visible min-h-[140px]">
            <h3 className="font-semibold text-gray-800">{features[active].title}</h3>
            <p className="text-gray-600 mt-2 text-sm">{features[active].desc}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href="/orthosaarthi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-cyan-600 text-white rounded text-sm inline-flex items-center whitespace-nowrap"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
