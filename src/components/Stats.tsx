import { motion } from "motion/react";
import { Users, BarChart3, ShieldAlert, Clock } from "lucide-react";

export default function Stats() {
  const statsList = [
    {
      count: "5000+",
      label: "Happy Users",
      desc: "Registered global developer profiles",
      color: "text-indigo-400",
      bgClr: "bg-indigo-500/5",
      icon: <Users className="w-5 h-5 text-indigo-400" />,
    },
    {
      count: "10000+",
      label: "Tools Used",
      desc: "Execution operations executed",
      color: "text-purple-400",
      bgClr: "bg-purple-500/5",
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
    },
    {
      count: "99.9%",
      label: "Accuracy",
      desc: "Algorithmic floating parameters precision",
      color: "text-cyan-400",
      bgClr: "bg-cyan-500/5",
      icon: <ShieldAlert className="w-5 h-5 text-cyan-400" />,
    },
    {
      count: "24/7",
      label: "Availability",
      desc: "Serverless container instance uptime",
      color: "text-pink-400",
      bgClr: "bg-pink-500/5",
      icon: <Clock className="w-5 h-5 text-pink-400" />,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-slate-950/20 border-y border-slate-800/40 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {statsList.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm hover:border-slate-700/80 transition-all flex flex-col items-center"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bgClr} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <h3 className={`text-2xl sm:text-3xl font-extrabold font-display ${stat.color} tracking-tight`}>
                {stat.count}
              </h3>
              <p className="text-white text-xs sm:text-sm font-bold tracking-tight mt-1.5">{stat.label}</p>
              <span className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1 block max-w-[12rem] mx-auto">
                {stat.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
