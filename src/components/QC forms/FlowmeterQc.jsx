import * as React from "react";
import {
  Box, Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  RadioGroup, FormControlLabel, Radio, Button, Stack
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";
const STORAGE_KEYf = "flowmeter-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes *" />
      <FormControlLabel value="No"  control={<Radio />} label="No *" />
    </RadioGroup>
  </FormControl>
);

export default function FlowmeterQC({ onBack }) {
  const [f, setF] = React.useState(() => {
    try {
      const raw = localStorage.getItem("STORAGE_KEYf");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const up = (k) => (eOrVal) =>
    setF((s) => ({ ...s, [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value }));

  const saveLocal = () => localStorage.setItem("STORAGE_KEYf", JSON.stringify(f));

      const resetForm = () => {
  setF({});
  localStorage.removeItem("STORAGE_KEYf");
};
  const saveAndPdf = async() =>  { 
    saveLocal();  
   const sections = makeSections({
    "A. Basic Information": {
      "Inspected by": f.inspector || "",
      "Date of Inspection": f.date || "",
    },
    "B. Visual Inspection": {
      "Type of Flowmeter": f.type,
      "Measuring Principle": f.principle,
      "Body Material": f.bodyMat,
      "Nominal Diameter": f.nominalDia,
      "Local Display Screen Present?": f.localDisplay,
      "Process Connection": f.processConn,
      "Wiring Terminal Blocks Present?": f.termBlocks,
      "Manual & Calibration Certificate Present?": f.manualCert,
      "Manufacturer": f.mfg,
      "Model": f.model,
      "Manufacturer Tag Present?": f.tagPresent,
    },
    "C. Functional Inspection": {
      "Display Matches Manual?": f.displayAsManual,
      "Rated Flowrate of Fluid Supply": f.ratedFlow,
      "Current Measured Flowrate": f.measuredFlow,
      "Supply Voltage": f.supplyV,
      "Output Signal": f.outputSig,
      "Output Matches PLC Readings?": f.matchPLC,
      "Provides Pressure & Temperature Readings?": f.pressTemp,
      "Transmitter Dimensions": f.txDims,
    },
    "D. Final Details": {
      "Assigned Tag": f.tag,
      "Is device OK for use?": f.ok,
      "Has the device met the needed specifications?": f.specs,
    },
  });

  const doc = await generateQCReport({
    title: "Instrument Quality Inspection Checklist – Flowmeters",
    sections,
    logoPath: "/logo.png",
    meta: { inspector: f.inspector, date: f.date },
  });

  doc.save(`Flowmeter_QC_${f.tag || "report"}.pdf`);

  resetForm();
};

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>Back to Home</Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Flowmeter QC Form</Typography>
      </Stack>

      {/* A. Basic Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>A. Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth type="date" label="2. Date of Inspection *" InputLabelProps={{ shrink: true }}
              value={f.date || ""} onChange={up("date")} required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* B. Visual Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Visual Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="fm-type">1. Type of Flowmeter *</InputLabel>
              <Select labelId="fm-type" label="1. Type of Flowmeter *"
                      value={f.type || ""} onChange={up("type")} required>
                {["Electromagnetic", "Coriolis", "Vortex", "Ultrasonic", "DP/Orifice", "Turbine","Thermal", "Other"]
                  .map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Measuring Principle (e.g., Vortices) *"
                       value={f.principle || ""} onChange={up("principle")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Body Material (e.g., Carbon steel) *"
                       value={f.bodyMat || ""} onChange={up("bodyMat")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Nominal Diameter *"
                       value={f.nominalDia || ""} onChange={up("nominalDia")} required/>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="5. Local Display Screen Present?" value={f.localDisplay} onChange={up("localDisplay")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="process-conn">6. Process Connection *</InputLabel>
              <Select labelId="process-conn" label="6. Process Connection *"
                      value={f.processConn || ""} onChange={up("processConn")} required>
                {["Flanged", "Threaded", "Tri-Clamp", "Welded"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="7. Wiring Terminal Blocks Present?" value={f.termBlocks} onChange={up("termBlocks")} required/>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="8. Is the Manual and Calibration Certificate Present? (e.g., Both available) *"
                       value={f.manualCert || ""} onChange={up("manualCert")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="9. Manufacturer (e.g., Yokogawa) *"
                       value={f.mfg || ""} onChange={up("mfg")} required/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="10. Model (e.g., FMX433) *"
                       value={f.model || ""} onChange={up("model")} required/>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="11. Is Manufacturer's Tag Present?" value={f.tagPresent} onChange={up("tagPresent")} required/>
          </Grid>
        </Grid>
      </Paper>

      {/* C. Functional Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>C. Functional Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <YesNo label="1. Does Display Show as Described in the Manual? (e.g., No, they differ)"
                   value={f.displayAsManual} onChange={up("displayAsManual")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Rated Flowrate of Fluid Supply (e.g., 5m3/h) *"
                       value={f.ratedFlow || ""} onChange={up("ratedFlow")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Current Measured Flowrate (e.g., 4.7m3/h) *"
                       value={f.measuredFlow || ""} onChange={up("measuredFlow")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Supply Voltage (e.g., 24V DC) *"
                       value={f.supplyV || ""} onChange={up("supplyV")} required/>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="5. Output Signal (e.g., 4–20mA and RS485) *"
                       value={f.outputSig || ""} onChange={up("outputSig")} required/>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="6. Does Output Display Match PLC Readings?" value={f.matchPLC} onChange={up("matchPLC")} required/>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="7. Does Flowmeter Give Pressure and Temperature Readings?"
                   value={f.pressTemp} onChange={up("pressTemp")} required/>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="8. Transmitter Dimensions (e.g., 60mm by 100mm) *"
                       value={f.txDims || ""} onChange={up("txDims")} required/>
          </Grid>
        </Grid>
      </Paper>

      {/* D. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>D. Final Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Assigned Tag *"
                       value={f.tag || ""} onChange={up("tag")} required/>
          </Grid>
          <Grid item xs={12}>
            <YesNo label="2. Is device OK for use?" value={f.ok} onChange={up("ok")} required/>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={3}
                       label="3. Has the device met the needed specifications? (Briefly describe) *"
                       value={f.specs || ""} onChange={up("specs")} required/>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
        <Button variant="contained" onClick={saveAndPdf}>SAVE AND UPLOAD PDF</Button>
        <Button variant="outlined" onClick={onBack}>BACK TO HOME</Button>
      </Stack>
    </Box>
  );
}

