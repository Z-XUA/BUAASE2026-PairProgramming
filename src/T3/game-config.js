export const MAX_DECISION_MS = Number(process.env.HM_MAX_DECISION_MS || 2000);

export const PLAYER_SPECS = [
  {
    name: "P1",
    modulePath: process.env.HM_P1_MODULE,
    modulePathCandidates: [
      "./t3-as/build/release.js",
      "./t3-rust/pkg/t3_rust.js",
      "./t3-rust/build/release.js",
      "./t3-cpp/pkg/t3_cpp.js",
      "./t3-cpp/build/release.js"
    ],
    exportName: process.env.HM_P1_EXPORT || "hanamikoji_action"
  },
  {
    name: "P2",
    modulePath: process.env.HM_P2_MODULE,
    modulePathCandidates: [
      "./t3-as/build/release.js",
      "./t3-rust/pkg/t3_rust.js",
      "./t3-rust/build/release.js",
      "./t3-cpp/pkg/t3_cpp.js",
      "./t3-cpp/build/release.js"
    ],
    exportName: process.env.HM_P2_EXPORT || "hanamikoji_action"
  }
];
