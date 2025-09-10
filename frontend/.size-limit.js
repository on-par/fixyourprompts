module.exports = [
  {
    name: "Main Bundle (JS)",
    path: "dist/js/index-*.js",
    limit: "50 kB"
  },
  {
    name: "React Vendor Bundle", 
    path: "dist/js/react-vendor-*.js",
    limit: "150 kB"
  },
  {
    name: "Other Vendor Libraries",
    path: "dist/js/vendor-*.js", 
    limit: "50 kB"
  },
  {
    name: "Total Bundle Size",
    path: "dist/js/*.js",
    limit: "250 kB"
  }
];