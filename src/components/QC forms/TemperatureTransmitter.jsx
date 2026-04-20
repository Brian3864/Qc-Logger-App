import * as React from "react";
import {
  Box, Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, RadioGroup, Radio, Button, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";
const STORAGE_KEY = "tt-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes *" />
      <FormControlLabel value="No" control={<Radio />} label="No *" />
    </RadioGroup>
  </FormControl>
);


export default function TemperatureTransmitterQC({ onBack }) {
  const [f, setF] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const up = (k) => (eOrVal) =>
    setF((s) => ({ ...s, [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value }));

  const saveLocal = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(f));

  const resetForm = () => {
  setF({});
  localStorage.removeItem(STORAGE_KEY);
};
  const saveAndPdf = async () => {
    saveLocal();
    const sections = makeSections({
      "A. Basic Information": {
        "Inspected by": f.inspector || "",
        "Date of Inspection": f.date || "",
        "Serial Number": f.serial || "",
      },
      "B. Sensor Visual Inspection": {
        "Sensor Type": f.sensorType,
        "Configuration – No. of Wires": f.config,
        "Sensor Shape": f.sensorShape,
        "Sensor Dimensions": f.sensorDimensions,
        "Process Connection": f.processConn,
        "Probe Diameter": f.probeDia,
        "Cable Length": f.cableLength,
        "Sensor Cable Material": f.cableMaterial,
        "Manufacturer": f.sensorMfg,
      },
      "C. Transmitter Inspection": {
        "Measured Supply Voltage": f.measSupply,
        "Output Signal": f.outputSig,
        "Installation/Mounting Method": f.mountMethod,
        "Visual Indicator Present?": f.visualPresent,
        "Visual Indicator Working?": f.visualWorking,
        "Ambient Temperature Reading": f.ambientTemp,
        "Enclosure Material": f.enclosureMat,
        "Transmitter Dimensions": f.txDims,
        "Cable Termination": f.term,
        "Manufacturer": f.txMfg,
        "Model": f.txModel,
      },
      "D. Final Details": {
        "Assigned Tag": f.tag,
        "Is device OK for use?": f.ok,
        "Has the device met the needed specifications?": f.specs,
      },
    });

    const doc = await generateQCReport({
      title: "Instrument Quality Inspection Checklist - Temperature Transmitters",
      preface:
        "Before inspection, ensure you have the specification sheet to confirm the requirements.",
      sections,
      footerNotes: [
        "Assign tag if manufacturer has not provided it. Tag as SPARE if not in list.",
      ],
      logoPath: "/logo.png",
      meta: { inspector: f.inspector, date: f.date, serial: f.serial },
    });

    const fileName = `TempTransmitter_QC_${f.tag || "report"}.pdf`;
    doc.save(fileName);
    resetForm();


    
  };

  const defaultTRows = Array.from({ length: 10 }, () => ({
  reference: "",
  actual: "",
}));

const [tRows, setTRows] = React.useState(defaultTRows);

const updateTReference = (index, value) => {
  setTRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, reference: value } : r
    )
  );
};

const updateTActual = (index, value) => {
  setTRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, actual: value } : r
    )
  );
};

const tData = tRows.map((row) => {
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
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Temperature Transmitter QC Form
        </Typography>
      </Stack>

      {/* A. Basic Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>A. Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth type="date" label="1. Date of inspection *" InputLabelProps={{ shrink: true }}
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
              <InputLabel id="sensor-type">1. Sensor Type *</InputLabel>
              <Select labelId="sensor-type" label="1. Sensor Type *"
                      value={f.sensorType || ""} onChange={up("sensorType")} required>
                {["RTD (Pt100)", "Thermocouple (J)", "Thermocouple (K)", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="config">2. Configuration – No. of Wires (e.g., 3 wire) *</InputLabel>
              <Select labelId="config" label="2. Configuration – No. of Wires (e.g., 3 wire) *"
                      value={f.config || ""} onChange={up("config")} required>
                {["2 wire", "3 wire", "4 wire"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Sensor Shape (e.g., Cylindrical probe) *"
                       value={f.sensorShape || ""} onChange={up("sensorShape")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Sensor Dimensions (e.g., 50mm) *"
                       value={f.sensorDimensions || ""} onChange={up("sensorDimensions")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="process-conn">5. Process Connection *</InputLabel>
              <Select labelId="process-conn" label="5. Process Connection *"
                      value={f.processConn || ""} onChange={up("processConn")} required>
                {["Threaded", "Flanged", "Tri-Clamp", "Other"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Probe Diameter (e.g., 5mm) *"
                       value={f.probeDia || ""} onChange={up("probeDia")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="7. Cable Length (e.g., 30m) *"
                       value={f.cableLength || ""} onChange={up("cableLength")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8. Sensor Cable Material (e.g., Teflon) *"
                       value={f.cableMaterial || ""} onChange={up("cableMaterial")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="9. Manufacturer (e.g., Yokogawa) *"
                       value={f.sensorMfg || ""} onChange={up("sensorMfg")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* C. Transmitter Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>C. Transmitter Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Measured Supply Voltage (e.g., 24V DC) *"
                       value={f.measSupply || ""} onChange={up("measSupply")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="output-sig">2. Output Signal *</InputLabel>
              <Select labelId="output-sig" label="2. Output Signal *"
                      value={f.outputSig || ""} onChange={up("outputSig")} required>
                {["4–20 mA", "0–10 V", "HART", "Modbus", "Other"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Maximum Number of Sensing Elements (e.g., 2) *"
                       value={f.maxElements || ""} onChange={up("maxElements")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Installation/Mounting Method (e.g., Flanged) *"
                       value={f.mountMethod || ""} onChange={up("mountMethod")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="5. Visual Indicator Present?" value={f.visualPresent} onChange={up("visualPresent")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="6. Visual Indicator Working?" value={f.visualWorking} onChange={up("visualWorking")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="7. Ambient Temperature Reading (e.g., 29) *"
                       value={f.ambientTemp || ""} onChange={up("ambientTemp")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8. Enclosure Material (e.g., Stainless steel) *"
                       value={f.enclosureMat || ""} onChange={up("enclosureMat")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="9. Transmitter Dimensions (e.g., 60mm by 100mm) *"
                       value={f.txDims || ""} onChange={up("txDims")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="10. Cable Termination (e.g., Hirschmann connector) *"
                       value={f.term || ""} onChange={up("term")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="11. Manufacturer (e.g., Yokogawa) *"
                       value={f.txMfg || ""} onChange={up("txMfg")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="12. Model (e.g., BZX200) *"
                       value={f.txModel || ""} onChange={up("txModel")} required />
          </Grid>
        </Grid>
      </Paper>
{/* D. Temperature Reading */}
     <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
  <Typography sx={{ fontWeight: 700, mb: 1 }}>
    D. Temperature Reading
  </Typography>

  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>
            Reference (°C)
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            Sensor reading (°C)
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            Deviation (°C)
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {tData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={row.reference}
                onChange={(e) =>
                  updateTReference(
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
                  updateTActual(
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
            <TextField fullWidth label="1. Assigned Tag (e.g., TT-0001) *"
                       value={f.tag || ""} onChange={up("tag")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="2. Is device OK for use?" value={f.ok} onChange={up("ok")} required />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={3}
                       label="3. Has the device met the needed specifications? *"
                       value={f.specs || ""} onChange={up("specs")} required />
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

