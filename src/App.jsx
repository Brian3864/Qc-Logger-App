import * as React from "react";
import {
  AppBar, Tabs,Toolbar,Switch, Box,  Tab, ThemeProvider, createTheme,
  CssBaseline, Container, Paper, Stack, Button, Typography, Breadcrumbs ,Link
} from "@mui/material";
import { Alert, TextField } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import InstrumentTable from "./components/InstrumentTable.jsx";
import CalibrationSheet from "./components/CalibrationSheet.jsx";
import SideBarNav from "./components/SideBarNav.jsx";
import TemperatureTransmitter from "./components/QC forms/TemperatureTransmitter.jsx";
import PressureTransmitterQc from "./components/QC forms/PressureTransmitterQc.jsx";
import HumidityTransmitterQc from "./components/QC forms/HumidityTransmitterQc.jsx";
import FlowmeterQc from "./components/QC forms/FlowmeterQc.jsx";
import GasSensorQc from "./components/QC forms/GasSensorQc.jsx";
import GasCoolerQc from "./components/QC forms/GasCoolerQc.jsx";
import LevelTransmitterQc from "./components/QC forms/LevelTransmitterQc.jsx";
import VelocitySensorQc from "./components/QC forms/VelocitySensorQc.jsx";
import SamplingPumpQc from "./components/QC forms/SamplingPumpQc.jsx";
import DifferentialPressureTransmitterQc from "./components/QC forms/DifferentialPressureTransmitterQC.jsx";
import LogoutIcon from "@mui/icons-material/Logout";


const STORAGE_KEY = "qc_current_user";

function Header({ userName = "Brian", dark, onToggleDark,  handleLogout }) {
  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
      <Toolbar sx={{ gap: 2, minHeight: 72 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Logo (replace src with your asset) */}
          <Box
            component="img"
            src= {`${process.env.PUBLIC_URL}/logo.png`}
            alt="Octavia Carbon"
            sx={{ height: 90, width: "auto", objectFit:"contain",opacity: 1.2, display:"block" }}
          />
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
            QC Logger <span style={{ opacity: 1.2, fontWeight: 700 }}>— Welcome, {userName}</span>
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
 

        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">Dark mode</Typography>
          <Switch checked={dark} onChange={onToggleDark} />

          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            LOGOUT
          </Button>
          
        </Stack>
      </Toolbar>
    </AppBar>
  );

}


export default function App({ user, onLogout }) {
  // 🔹 All hooks live in a component (OK)
  const [dark, setDark] = React.useState(false);
  const [tab, setTab] = React.useState(0);                 // 0=QC, 1=Calibration
  const [view, setView] = React.useState("home");          // 'home' | 'qcForm' | 'calSheet'
  const [instrumentKey, setInstrumentKey] = React.useState(null);
  const [instrumentTitle, setInstrumentTitle] = React.useState(null);

  const theme = React.useMemo(
    () => createTheme({
      palette: { mode: dark ? "dark" : "light", primary: { main: "#1976d2" }, 
          background: {
          default: dark ? "#0b1220" : "#f5f7fb",
          paper: dark ? "#0f1a2b" : "#ffffff",
        },
    
    },
      shape: { borderRadius: 14 },
      
      typography: {
        fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
        h6: { fontWeight: 800, fontSize: "1.05rem" },
        h4: { fontWeight: 900, fontSize: "1.9rem" },
        body2: { fontSize: "0.9rem" },
      },
       components: {
        MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
        MuiButton: { styleOverrides: { root: { borderRadius: 12, fontWeight: 700 } } },
      },

    }),
    [dark]
  );
const handleLogout = async () => {
    try {
      await onLogout(); // this calls signOut(auth)
    } catch (e) {
      console.error(e);
      alert(e?.message || "Logout failed");
    }
  };

  const mode = tab === 0 ? "qc" : "cal";
  const goHome = () => setView("home");

  // 🔹 Called from QC tab buttons
  const onOpenQC = (item) => {
    setInstrumentKey(item.key);      // e.g., 'valve'
    setInstrumentTitle(item.label);  // e.g., 'VALVE QC'
    setView("qcForm");
  };

  // 🔹 Called from Calibration tab buttons
  const onOpenCal = (item) => {
    setInstrumentKey(item.key);      // e.g., 'flowmeter'
    setInstrumentTitle(item.label);  // e.g., 'FLOWMETER CALIBRATION'
    setView("calSheet");
  };
    const qcItems = [
    { label: "VALVE QC", key: "valve" },
    { label: "TEMPERATURE TRANSMITTER QC", key: "temperature-transmitter" },
    { label: "FLOWMETER QC", key: "flowmeter" },
    { label: "PRESSURE TRANSMITTER QC", key: "pressure-transmitter" },
    { label: "HUMIDITY TRANSMITTER QC", key: "humidity-transmitter" },
    { label: "GAS SENSOR QC", key: "gas-sensor" },
    { label: "GAS COOLER QC", key: "gas-cooler" },
    { label: "LEVEL TRANSMITTER QC", key: "level-transmitter" },
    { label: "VELOCITY SENSOR QC", key: "velocity-sensor" },
    { label: "SAMPLING PUMP QC", key: "sampling-pump" },
    { label: "DIFFERENTIAL PRESSURE TRANSMITTER QC", key: "dp-transmitter" },

  ];

  const calItems = [
    { label: "FLOWMETER CALIBRATION", key: "flowmeter" },
    { label: "TEMPERATURE TRANSMITTER CALIBRATION", key: "temperature-transmitter" },
    { label: "PRESSURE TRANSMITTER CALIBRATION", key: "pressure-transmitter" },
    { label: "HUMIDITY TRANSMITTER CALIBRATION", key: "humidity-transmitter" },
    { label: "GAS ANALYZER CALIBRATION", key: "gas-sensor" },
  ];

  const sectionName = mode === "qc" ? "Quality Control" : "Calibration";

const pageTitle =
  view === "home"
    ? (mode === "qc" ? "QC Dashboard" : "Calibration Dashboard")
    : instrumentTitle || "Instrument";

const breadcrumbs = (
  <Breadcrumbs sx={{ mb: 2 }}>
    <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }} onClick={goHome}>
      Home
    </Link>
    <Typography color="text.secondary">{sectionName}</Typography>
    {view !== "home" && <Typography sx={{ fontWeight: 800 }}>{instrumentTitle}</Typography>}
  </Breadcrumbs>
);

const [drawerOpen, setDrawerOpen] = React.useState(true);

const setMode = (m) => {
  setTab(m === "qc" ? 0 : 1);
  goHome();
};
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

       {/* 🔵 Top header with title, user and logout */}
    <Header
      userName="Brian"
      dark={dark}
      onToggleDark={() => setDark((v) => !v)}
      handleLogout={handleLogout}
    />
 
     

      {/* Router-ish rendering */}

      {view === "home" && (
  <Box sx={{ display: "flex", gap: 2, px: 2, py: 3 }}>
    <SideBarNav
      mode={mode} // "qc" or "cal"
      onSetMode={(m) => {
        setTab(m === "qc" ? 0 : 1);
        goHome();
      }}
      qcItems={qcItems}
      calItems={calItems}
      onPickQC={onOpenQC}
      onPickCal={onOpenCal}
    />

    {/* CENTER CONTENT (image + summary) */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      

      <Paper
        variant="outlined"
        sx={{
          p: 2,
           borderRadius: 3,
           overflow: "hidden",
           position: "relative",
        }}
      >
        <Box
          component="img"
          src={process.env.PUBLIC_URL + "/dashboard.jpg"}
          alt="Dashboard"
          sx={{
          width: "100%",
          maxHeight: 900,
          objectFit: "cover",
          borderRadius: 3,
          transition: "transform 220ms ease",
          "&:hover": { transform: "scale(1.01)" },
    }}
        />
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
        variant="contained"
        onClick={() => {
        setTab(0);
        goHome();
    }}
        >
         Start QC
         </Button>

         <Button
         variant="outlined"
         onClick={() => {
         setTab(1);
         goHome();
    }}
        >
          Start Calibration
        </Button>
        </Box>
      </Paper>
    </Box>
  </Box>
)}
     
      {view === "qcForm" && (
  instrumentKey === "temperature-transmitter" ? (
    <TemperatureTransmitter onBack={goHome} />
  ) : instrumentKey === "flowmeter" ? (
    <FlowmeterQc onBack={goHome} />
  ) : instrumentKey === "pressure-transmitter" ? (
    <PressureTransmitterQc onBack={goHome} />
  ) : instrumentKey === "humidity-transmitter" ? (
    <HumidityTransmitterQc onBack={goHome} />
  ) : instrumentKey === "gas-sensor" ? (
    <GasSensorQc onBack={goHome} />
  ) : instrumentKey === "gas-cooler" ? (
    <GasCoolerQc onBack={goHome} />
  ) : instrumentKey === "level-transmitter" ? (
  <LevelTransmitterQc onBack={goHome} />
  ) : instrumentKey === "velocity-sensor" ? (
  <VelocitySensorQc onBack={goHome} />
  
  ) :  instrumentKey === "sampling-pump" ? (
  <SamplingPumpQc onBack={goHome} />
  ) : instrumentKey === "dp-transmitter" ? (
  <DifferentialPressureTransmitterQc onBack={goHome} />
  ): (
    <InstrumentTable
      mode="qc"
      instrument={instrumentTitle}
      instrumentKey={instrumentKey}
      onBack={goHome}
    />
  )
)}

      {view === "calSheet" && (
        <CalibrationSheet
          instrument={instrumentKey}     // e.g., 'flowmeter'
          prettyTitle={instrumentTitle}
          onBack={goHome}
        />
      )}
    </ThemeProvider>
  );
  
  
}

/* ---------- Home: separate button sets per tab ---------- */
