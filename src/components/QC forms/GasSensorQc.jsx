import * as React from "react";
import {
  Box, Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  RadioGroup, FormControlLabel, Radio, Button, Stack
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";
const STORAGE_KEYg = "gas-sensor-qc-form";

/* Reusable Yes/No radio row */
const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes *" />
      <FormControlLabel value="No"  control={<Radio />} label="No *" />
    </RadioGroup>
  </FormControl>
);

export default function GasSensorQC({ onBack }) {
  const [f, setF] = React.useState(() => {
    try {
      const raw = localStorage.getItem("STORAGE_KEYg");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const up = (k) => (eOrVal) =>
    setF((s) => ({ ...s, [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value }));

  const saveLocal   = () => localStorage.setItem("STORAGE_KEYg", JSON.stringify(f));

  const resetForm = () => {
  setF({});
  localStorage.removeItem("STORAGE_KEYg");
};
  const saveAndPdf  = async() => { 
    saveLocal(); 
const sections = makeSections({
    "A. Basic Information": {
      "Inspected by": f.inspector || "",
      "Date of Inspection": f.date || "",
      "Serial Number": f.serial || "",
    },
    "B. Sensor Inspection": {
      "Sensed Gas": f.sensedGas,
      "Type of Sensor": f.sensorType,
      "Process Connection": f.processConn,
      "Sensor Dimensions": f.sensorDims,
      "Manufacturer": f.sensorMfg,
      "Model": f.sensorModel,
    },
    "C. Transmitter Inspection": {
      "Measured Supply Voltage": f.supplyV,
      "Output Signal": f.outputSig,
      "Installation/Mounting Method": f.mountMethod,
      "Visual Indicator Present?": f.visualPresent,
      "Visual Indicator Working?": f.visualWorking,
      "Ambient Concentration Reading": f.ambientReading,
      "Transmitter Case Material": f.caseMaterial,
      "Transmitter Dimensions": f.txDims,
      "Cable Termination": f.cableTerm,
      "Manufacturer": f.txMfg,
      "Model": f.txModel,
      "Manufacturer’s Tag Present?": f.tagPresent,
    },
    "D. Final Details": {
      "Assigned Tag": f.tag,
      "Is device OK for use?": f.ok,
      "Has the device met the needed specifications?": f.specs,
    },
  });

  const doc = await generateQCReport({
    title: "Instrument Quality Inspection Checklist – Gas Sensors",
    sections,
    logoPath: "/logo.png",
    meta: { inspector: f.inspector, date: f.date, serial: f.serial },
  });

  doc.save(`GasSensor_QC_${f.tag || "report"}.pdf`);
   resetForm();

};

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>Back to Home</Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Gas Sensor QC Form</Typography>
      </Stack>

      {/* A. Basic Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>A. Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth type="date" label="1. Date of Inspection *" InputLabelProps={{ shrink: true }}
              value={f.date || ""} onChange={up("date")} required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* B. Sensor Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Sensor Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="gas-type">1. Sensed Gas *</InputLabel>
              <Select
                labelId="gas-type" label="1. Sensed Gas *"
                value={f.sensedGas || ""} onChange={up("sensedGas")} required
              >
                {["O₂", "CO₂", "CO", "CH₄", "H₂S", "NH₃", "VOC", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="sensor-type">2. Type of Sensor *</InputLabel>
              <Select
                labelId="sensor-type" label="2. Type of Sensor *"
                value={f.sensorType || ""} onChange={up("sensorType")} required
              >
                {["Electrochemical", "NDIR", "Catalytic", "MOS", "Photoionization", "Optical", "Other"]
                  .map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="3. Process Connection (e.g., 6mm sampling pipe) *"
              value={f.processConn || ""} onChange={up("processConn")} required />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="4. Sensor Dimensions (e.g., 20mm diameter × 60mm) *"
              value={f.sensorDims || ""} onChange={up("sensorDims")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="5. Manufacturer (e.g., SST) *"
              value={f.sensorMfg || ""} onChange={up("sensorMfg")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Model (e.g., O2-BM-18S) *"
              value={f.sensorModel || ""} onChange={up("sensorModel")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* C. Transmitter Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>C. Transmitter Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Measured Supply Voltage (e.g., 24V DC) *"
              value={f.supplyV || ""} onChange={up("supplyV")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="output-sig">2. Output Signal *</InputLabel>
              <Select
                labelId="output-sig" label="2. Output Signal *"
                value={f.outputSig || ""} onChange={up("outputSig")} required
              >
                {["4–20 mA", "0–10 V", "Relay", "Pulse", "Modbus/RS485", "HART", "Other"]
                  .map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="3. Installation/Mounting Method (e.g., Panel mounted) *"
              value={f.mountMethod || ""} onChange={up("mountMethod")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="4. Visual Indicator Present?" value={f.visualPresent} onChange={up("visualPresent")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="5. Visual Indicator Working?" value={f.visualWorking} onChange={up("visualWorking")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Ambient Concentration Reading (e.g., 20%) *"
              value={f.ambientReading || ""} onChange={up("ambientReading")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="7. Transmitter’s Case Material (e.g., Stainless steel) *"
              value={f.caseMaterial || ""} onChange={up("caseMaterial")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8. Transmitter Dimensions (e.g., 40mm diameter × 100mm) *"
              value={f.txDims || ""} onChange={up("txDims")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="9. Cable Termination (e.g., Terminal block on PCB) *"
              value={f.cableTerm || ""} onChange={up("cableTerm")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="10. Manufacturer (e.g., Yokogawa) *"
              value={f.txMfg || ""} onChange={up("txMfg")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="11. Model (e.g., BZX200) *"
              value={f.txModel || ""} onChange={up("txModel")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="12. Is Manufacturer’s Tag Present?" value={f.tagPresent} onChange={up("tagPresent")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* D. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>D. Final Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Assigned Tag (e.g., GV-0001) *"
              value={f.tag || ""} onChange={up("tag")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="2. Is device OK for use?" value={f.ok} onChange={up("ok")} required />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth multiline minRows={3}
              label="3. Has the device met the needed specifications? (Briefly describe) *"
              value={f.specs || ""} onChange={up("specs")} required
            />
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

