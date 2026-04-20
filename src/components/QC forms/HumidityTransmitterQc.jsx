import * as React from "react";
import {
  Box, Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  RadioGroup, FormControlLabel, Radio, Button, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";
const STORAGE_KEYh = "ht-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes *" />
      <FormControlLabel value="No"  control={<Radio />} label="No *" />
    </RadioGroup>
  </FormControl>
);

export default function HumidityTransmitterQC({ onBack }) {
  const [f, setF] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYh);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const up = (k) => (eOrVal) =>
    setF((s) => ({ ...s, [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value }));

  const saveLocal = () => localStorage.setItem(STORAGE_KEYh, JSON.stringify(f));

    const resetForm = () => {
  setF({});
  localStorage.removeItem(STORAGE_KEYh);
};
  const saveAndPdf = async() => { 
    saveLocal(); 
    
 const sections = makeSections({
    "A. Basic Information": {
      "Inspected by": f.inspector || "",
      "Date of Inspection": f.date || "",
      "Serial Number": f.serial || "",
    },
    "B. Sensor Visual Inspection": {
      "Type of Sensor": f.sensorType,
      "Process Connection": f.processConn,
      "Sensor Probe Dimensions": f.probeDims,
      "Manufacturer": f.sensorMfg,
      "Model": f.sensorModel,
      "Sensor comes with Cable?": f.hasCable,
    },
    "C. Transmitter Inspection": {
      "Measured Supply Voltage": f.supplyV,
      "Output Signal": f.outputSig,
      "Installation/Mounting Method": f.mountMethod,
      "Visual Indicator Present?": f.visualPresent,
      "Visual Indicator Working?": f.visualWorking,
      "Ambient RH Reading": f.ambientRH,
      "Ambient Temperature": f.ambientTemp,
      "Enclosure Material": f.enclosureMat,
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
    title: "Instrument Quality Inspection Checklist – Humidity Transmitters",
    sections,
    logoPath: "/logo.png",
    meta: { inspector: f.inspector, date: f.date, serial: f.serial },
  });

  doc.save(`HumidityTransmitter_QC_${f.tag || "report"}.pdf`);
  resetForm();

};

const defaultHRows = Array.from({ length: 10 }, () => ({
  reference: "",
  actual: "",
}));

const [hRows, setHRows] = React.useState(defaultHRows);

const updateHReference = (index, value) => {
  setHRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, reference: value } : r
    )
  );
};

const updateHActual = (index, value) => {
  setHRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, actual: value } : r
    )
  );
};

const hData = hRows.map((row) => {
  const reference =
    row.reference === "" ? null : Number(row.reference);

  const actual =
    row.actual === "" ? null : Number(row.actual);

  const deviation =
    reference === null ||
    actual === null ||
    Number.isNaN(reference) ||
    Number.isNaN(actual)
      ? ""
      : (actual - reference).toFixed(2);

  return {
    ...row,
    deviation,
  };
});


  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>Back to Home</Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Humidity Transmitter QC Form</Typography>
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

      {/* B. Sensor Visual Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Sensor Visual Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="sensor-type">1. Type of Sensor *</InputLabel>
              <Select
                labelId="sensor-type" label="1. Type of Sensor *"
                value={f.sensorType || ""} onChange={up("sensorType")} required
              >
                {["Capacitive RH", "Resistive RH", "Digital RH/Temp", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="process-conn">2. Process Connection *</InputLabel>
              <Select
                labelId="process-conn" label="2. Process Connection *"
                value={f.processConn || ""} onChange={up("processConn")} required
              >
                {["Threaded", "Flanged", "Tri-Clamp", "Duct Probe", "Wall Mount"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth label="3. Sensor Probe Dimensions (e.g., 20mm diameter × 60mm) *"
              value={f.probeDims || ""} onChange={up("probeDims")} required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Manufacturer (e.g., Yokogawa) *"
              value={f.sensorMfg || ""} onChange={up("sensorMfg")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="5. Model (e.g., RH3635) *"
              value={f.sensorModel || ""} onChange={up("sensorModel")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="6. Does Sensor Come with a Cable?" value={f.hasCable} onChange={up("hasCable")} required />
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
                {["4–20 mA", "0–10 V", "Modbus/RS485", "HART", "Pulse", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="3. Installation/Mounting Method (e.g., Flanged, DN20 ANSI) *"
              value={f.mountMethod || ""} onChange={up("mountMethod")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="4. Visual Indicator Present?" value={f.visualPresent} onChange={up("visualPresent")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="5. Visual Indicator Working?" value={f.visualWorking} onChange={up("visualWorking")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Ambient RH Reading (e.g., 46%) *"
              value={f.ambientRH || ""} onChange={up("ambientRH")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="7. Ambient Temperature (if applicable, e.g., 27) *"
              value={f.ambientTemp || ""} onChange={up("ambientTemp")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8. Enclosure Material (e.g., Stainless steel) *"
              value={f.enclosureMat || ""} onChange={up("enclosureMat")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="9. Transmitter Dimensions (e.g., 40mm × 100mm) *"
              value={f.txDims || ""} onChange={up("txDims")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="10. Cable Termination (e.g., Hirschmann connector) *"
              value={f.cableTerm || ""} onChange={up("cableTerm")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="11. Manufacturer (e.g., Yokogawa) *"
              value={f.txMfg || ""} onChange={up("txMfg")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="12. Model (e.g., BZX200) *"
              value={f.txModel || ""} onChange={up("txModel")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="13. Is Manufacturer’s Tag Present?" value={f.tagPresent} onChange={up("tagPresent")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* D. Humidity Sensor readings */}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
  <Typography sx={{ fontWeight: 700, mb: 1 }}>
    Humidity Sensor readings
  </Typography>

  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>
            Reference reading (%)
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            Sensor reading (%)
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            Deviation (%)
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {hData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={row.reference}
                onChange={(e) =>
                  updateHReference(
                    index,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Enter reference"
              />
            </TableCell>

            <TableCell>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={row.actual}
                onChange={(e) =>
                  updateHActual(
                    index,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Enter reading"
              />
            </TableCell>

            <TableCell>
              {row.deviation !== "" ? row.deviation : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>
      
      {/* E. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>E. Final Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Assigned Tag *" value={f.tag || ""} onChange={up("tag")} required />
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

