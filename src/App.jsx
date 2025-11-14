import * as React from "react";
import {
  AppBar, Tabs,Toolbar,Switch, Box,  Tab, ThemeProvider, createTheme,
  CssBaseline, Container, Paper, Stack, Button, Typography
} from "@mui/material";
import { Alert, TextField } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import InstrumentTable from "./components/InstrumentTable.jsx";
import CalibrationSheet from "./components/CalibrationSheet.jsx";
import TemperatureTransmitter from "./components/QC forms/TemperatureTransmitter.jsx";
import PressureTransmitterQc from "./components/QC forms/PressureTransmitterQc.jsx";
import HumidityTransmitterQc from "./components/QC forms/HumidityTransmitterQc.jsx";
import FlowmeterQc from "./components/QC forms/FlowmeterQc.jsx";
import GasSensorQc from "./components/QC forms/GasSensorQc.jsx";
import LogoutIcon from "@mui/icons-material/Logout";

const STORAGE_KEY = "qc_current_user";

function Header({ userName = "Brian", dark, onToggleDark, onLogout }) {
  return (
    <AppBar position="static" elevation={1} color="primary">
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Logo (replace src with your asset) */}
          <Box
            component="img"
            src= "/logo.png" 
            alt="Octavia Carbon"
            sx={{ width: 90, height: 40, borderRadius: "50%" }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            QC Logger — Welcome, {userName}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">Dark mode</Typography>
          <Switch checked={dark} onChange={onToggleDark} />
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
            LOGOUT
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );

}


export default function App() {
  // 🔹 All hooks live in a component (OK)
  const [dark, setDark] = React.useState(false);
  const [tab, setTab] = React.useState(0);                 // 0=QC, 1=Calibration
  const [view, setView] = React.useState("home");          // 'home' | 'qcForm' | 'calSheet'
  const [instrumentKey, setInstrumentKey] = React.useState(null);
  const [instrumentTitle, setInstrumentTitle] = React.useState(null);

  const theme = React.useMemo(
    () => createTheme({
      palette: { mode: dark ? "dark" : "light", primary: { main: "#1976d2" } }
    }),
    [dark]
  );


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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

       {/* 🔵 Top header with title, user and logout */}
    <Header
      userName="Brian"
      dark={dark}
      onToggleDark={() => setDark((v) => !v)}
      onLogout={() => alert("Implement your logout here")}
    />
       
      {/* Top tabs */}
      <AppBar position="static" color="default" elevation={0}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); goHome(); }}
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Quality Control" />
          <Tab label="Calibration" />
        </Tabs>
      </AppBar>

      {/* Router-ish rendering */}
      {view === "home" && (
        <Home mode={mode} onOpenQC={onOpenQC} onOpenCal={onOpenCal} />
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
  ) : (
    <InstrumentTable
      mode="qc"
      instrument={instrumentTitle}      // handles Valve QC form (and others as you add them)
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
function Home({ onOpenQC, onOpenCal, mode }) {
  const qcItems = [
    { label: "VALVE QC", key: "valve" },
    { label: "TEMPERATURE TRANSMITTER QC", key: "temperature-transmitter" },
    { label: "FLOWMETER QC", key: "flowmeter" },
    { label: "PRESSURE TRANSMITTER QC", key: "pressure-transmitter" },
    { label: "HUMIDITY TRANSMITTER QC", key: "humidity-transmitter" },
    { label: "GAS SENSOR QC", key: "gas-sensor" },
  ];

  const calItems = [
    { label: "FLOWMETER CALIBRATION", key: "flowmeter" },
    { label: "TEMPERATURE TRANSMITTER CALIBRATION", key: "temperature-transmitter" },
    { label: "PRESSURE TRANSMITTER CALIBRATION", key: "pressure-transmitter" },
    { label: "HUMIDITY TRANSMITTER CALIBRATION", key: "humidity-transmitter" },
    { label: "GAS ANALYZER CALIBRATION", key: "gas-sensor" },
  ];

  const items = mode === "qc" ? qcItems : calItems;
  const handleClick = (it) => (mode === "qc" ? onOpenQC(it) : onOpenCal(it));

  const title = mode === "qc" ? "Instrument QC" : "Instrument Calibration";
  const subtitle =
    mode === "qc"
      ? "Select an instrument to log its quality control details."
      : "Select an instrument to prepare a calibration certificate.";

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ textAlign: "center", py: { xs: 6, md: 10 }, px: { xs: 2, md: 8 } }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>{subtitle}</Typography>

        <Stack spacing={2} alignItems="center">
          {items.map((it) => (
            <Button
              key={it.key}
              variant="contained"
              size="large"
              onClick={() => handleClick(it)}
              sx={{ width: 420, maxWidth: "100%", fontWeight: 700 }}
            >
              {it.label}
            </Button>
          ))}
          <Button variant="outlined" size="large" disabled sx={{ width: 420, fontWeight: 700, opacity: 0.65 }}>
            PH METER (COMING SOON)
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

