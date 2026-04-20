import * as React from "react";
import {
  Box, Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  RadioGroup, FormControlLabel, Radio, Button, Stack,
   Table, TableBody, TableCell, TableContainer, TableHead, TableRow

} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";
const STORAGE_KEYp = "pt-qc-form";

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

export default function PressureTransmitterQC({ onBack }) {
  const [f, setF] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYp);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const up = (k) => (eOrVal) =>
    setF((s) => ({ ...s, [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value }));

  const saveLocal = () => localStorage.setItem(STORAGE_KEYp, JSON.stringify(f));

    const resetForm = () => {
  setF({});
  localStorage.removeItem(STORAGE_KEYp);
};
  const saveAndPdf = async() => { 
    saveLocal(); 
const sections = makeSections({
    "A. Basic Information": {
      "Inspected by": f.inspector || "",
      "Date of Inspection": f.date || "",
      "Serial Number": f.serial || "",
    },
    "B. Instrument Details": {
      "Sensor Type": f.sensorType,
      "Manufacturer": f.manufacturer,
      "Process Connection": f.processConn,
      "Has Silicone Oil Diaphragm": f.siliconeOil,
      "Sensor Model": f.sensorModel,
      "Measured Supply Voltage": f.supplyV,
      "Output Signal": f.outputSig,
      "Measures Absolute Pressures": f.absPressure,
    },
    "C. Visual Inspection": {
      "Visual Indicator Present?": f.visualPresent,
      "Visual Indicator Working?": f.visualWorking,
      "Manufacturer Tag Present?": f.tagPresent,
    },
    "D. Operational Inspection": {
      "Ambient Pressure Reading": f.ambientPressure,
      "Installation Method": f.installMethod,
      "Enclosure Material": f.enclosureMat,
      "Transmitter Dimensions": f.txDims,
      "Cable Termination": f.cableTerm,
    },
    "E. Final Details": {
      "Transmitter Manufacturer": f.txMfg,
      "Transmitter Model": f.txModel,
      "Assigned Tag": f.tag,
      "Is OK for Use": f.ok,
      "Has Met Specifications": f.specs,
    },
  });

  const doc = await generateQCReport({
    title: "Instrument Quality Inspection Checklist – Pressure Transmitters",
    sections,
    logoPath: "/logo.png",
    meta: { inspector: f.inspector, date: f.date, serial: f.serial },
  });

  doc.save(`PressureTransmitter_QC_${f.tag || "report"}.pdf`);
  resetForm();


};
const defaultPTrows = Array.from({ length: 10 }, () => ({
  reference: "",
  actual: "",
}));

const [ptRows, setPtRows] = React.useState(defaultPTrows);

const updatePTReference = (index, value) => {
  setPtRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, reference: value } : r
    )
  );
};

const updatePTActual = (index, value) => {
  setPtRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, actual: value } : r
    )
  );
};

const ptData = ptRows.map((row) => {
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
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Pressure Transmitter QC Form</Typography>
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

      {/* B. Instrument Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Instrument Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Sensor Type *" value={f.sensorType || ""} onChange={up("sensorType")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Manufacturer *" value={f.manufacturer || ""} onChange={up("manufacturer")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="process-conn">3. Process Connection *</InputLabel>
              <Select
                labelId="process-conn"
                label="3. Process Connection *"
                value={f.processConn || ""}
                onChange={up("processConn")}
                required
              >
                {["Flanged", "Threaded", "Tri-Clamp", "Welded", "Manifold"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="4. Has Silicone Oil Diaphragm" value={f.siliconeOil} onChange={up("siliconeOil")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="5. Sensor Model *" value={f.sensorModel || ""} onChange={up("sensorModel")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Measured Supply Voltage *" value={f.supplyV || ""} onChange={up("supplyV")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="output-sig">7. Output Signal *</InputLabel>
              <Select
                labelId="output-sig"
                label="7. Output Signal *"
                value={f.outputSig || ""}
                onChange={up("outputSig")}
                required
              >
                {["4–20 mA", "0–10 V", "HART", "Modbus", "RS485"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <YesNo label="8. Measures Absolute Pressures" value={f.absPressure} onChange={up("absPressure")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* C. Visual Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>C. Visual Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <YesNo label="1. Is Visual Indicator Present" value={f.visualPresent} onChange={up("visualPresent")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="2. Is Visual Indicator Working" value={f.visualWorking} onChange={up("visualWorking")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="3. Is Manufacturer Tag Present" value={f.tagPresent} onChange={up("tagPresent")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* D. Operational Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>D. Operational Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Ambient Pressure Reading *" value={f.ambientPressure || ""} onChange={up("ambientPressure")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Installation Method *" value={f.installMethod || ""} onChange={up("installMethod")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Enclosure Material *" value={f.enclosureMat || ""} onChange={up("enclosureMat")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Transmitter Dimensions *" value={f.txDims || ""} onChange={up("txDims")} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="5. Cable Termination *" value={f.cableTerm || ""} onChange={up("cableTerm")} required />
          </Grid>
        </Grid>
      </Paper>

       {/* E. Pressure Reading */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
  <Typography sx={{ fontWeight: 700, mb: 1 }}>
    E. Pressure Readings
  </Typography>

  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>
            Reference reading (bar)
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            Sensor reading (bar)
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            Deviation (bar)
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {ptData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={row.reference}
                onChange={(e) =>
                  updatePTReference(
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
                  updatePTActual(
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

      {/* F. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>F. Final Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Transmitter Manufacturer *" value={f.txMfg || ""} onChange={up("txMfg")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Transmitter Model *" value={f.txModel || ""} onChange={up("txModel")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Assigned Tag *" value={f.tag || ""} onChange={up("tag")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="4. Is OK for Use" value={f.ok} onChange={up("ok")} required />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth multiline minRows={3}
              label="6. Has Met Specifications (Briefly describe performance anomalies or pass/fail) *"
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

