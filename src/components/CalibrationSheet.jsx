
import * as React from "react";
import {
  Box, Paper, Typography, Grid, TextField, Stack, Button, Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

function toCSV(rows, columns) {
  const headers = columns.map(c => c.headerName || c.field);
  const csvRows = [headers.join(",")];
  rows.forEach(r => {
    csvRows.push(
      columns.map(c => `"${String(r[c.field] ?? "").replace(/"/g, '""')}"`).join(",")
    );
  });
  return csvRows.join("\r\n");
}

const flowmeterColumns = [
  { field: "id", headerName: "#", width: 70 },
  { field: "testPoint", headerName: "Test Point No.", width: 140, editable: true },
  { field: "qNorm", headerName: "Nominal Flow Rate (QNorm) kg/hr", flex: 1, minWidth: 200, editable: true },
  { field: "qInd", headerName: "Indicated Reading (Qind) kg/hr", flex: 1, minWidth: 200, editable: true },
  { field: "qCorr", headerName: "Correction (Qcorr) kg/hr", flex: 1, minWidth: 180, editable: true },
  { field: "err", headerName: "Error (Qind - QNorm) kg/hr", flex: 1, minWidth: 210, editable: true },
  { field: "pctErr", headerName: "Percent Error (%)", flex: 0.7, minWidth: 160, editable: true },
  { field: "kFactor", headerName: "Correction Factor (K-Factor)", flex: 1, minWidth: 200, editable: true },
  { field: "pass", headerName: "Pass / Fail", flex: 0.6, minWidth: 130, editable: true },
];

// Generic fall-back columns for other instruments
const genericColumns = [
  { field: "id", headerName: "#", width: 70 },
  { field: "testPoint", headerName: "Test Point No.", width: 140, editable: true },
  { field: "input", headerName: "Input / Setpoint", flex: 1, minWidth: 180, editable: true },
  { field: "indicated", headerName: "Indicated", flex: 1, minWidth: 160, editable: true },
  { field: "asFound", headerName: "As-Found", flex: 1, minWidth: 140, editable: true },
  { field: "asLeft", headerName: "As-Left", flex: 1, minWidth: 140, editable: true },
  { field: "error", headerName: "Error", flex: 0.7, minWidth: 120, editable: true },
  { field: "tolerance", headerName: "Tolerance", flex: 0.7, minWidth: 120, editable: true },
  { field: "pass", headerName: "Pass / Fail", flex: 0.6, minWidth: 130, editable: true },
];

const headStyle = { bgcolor: "primary.main", color: "primary.contrastText", px: 2, py: 1, borderRadius: 1 };

export default function CalibrationSheet({ instrument, onBack }) {
  const isFlow = /flowmeter/i.test(instrument);

  const [meta, setMeta] = React.useState({
    engineer: "", approver: "",
    certNo: "", issueDate: "", nextCal: "",
    stdUsed: "", stdCertNos: "",
    mfg: "", model: "", serial: "", tag: "", type: "",
    fluid: "", nominalSize: "", range: "",
    ambTemp: "", ambPress: "", fluidTemp: "", fluidPress: "", relHumidity: ""
  });

  const storageKey = `cal-sheet-${instrument}`;
  const [rows, setRows] = React.useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : Array.from({ length: 5 }, (_, i) => ({ id: i + 1, testPoint: i + 1 }));
    } catch {
      return Array.from({ length: 5 }, (_, i) => ({ id: i + 1, testPoint: i + 1 }));
    }
  });

  const columns = isFlow ? flowmeterColumns : genericColumns;

  const processRowUpdate = (newRow) => {
    setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));
    return newRow;
  };

  const addRow = () => {
    const id = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows(prev => [...prev, { id, testPoint: id }]);
  };

  const saveLocal = () => {
    localStorage.setItem(storageKey, JSON.stringify(rows));
    localStorage.setItem(`${storageKey}-meta`, JSON.stringify(meta));
  };

  const loadLocal = () => {
    const r = localStorage.getItem(storageKey);
    const m = localStorage.getItem(`${storageKey}-meta`);
    if (r) setRows(JSON.parse(r));
    if (m) setMeta(JSON.parse(m));
  };

  const exportCSV = () => {
    const csv = toCSV(rows, columns.filter(c => c.field !== "id"));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${instrument}-calibration.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bind = (k) => ({
    value: meta[k] || "",
    onChange: (e) => setMeta(s => ({ ...s, [k]: e.target.value }))
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>Back to Home</Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Calibration Certificate — {instrument}
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography sx={headStyle}>Details</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}><TextField label="I&C Engineer Incharge" fullWidth {...bind("engineer")} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Approved by" fullWidth {...bind("approver")} /></Grid>

          <Grid item xs={12} md={4}><TextField label="Certificate Number" fullWidth {...bind("certNo")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Issue Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...bind("issueDate")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Next Calibration Due" type="date" fullWidth InputLabelProps={{ shrink: true }} {...bind("nextCal")} /></Grid>

          <Grid item xs={12} md={6}><TextField label="Calibration Standard(s) Used" fullWidth {...bind("stdUsed")} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Standard Calibration Certificate No(s)." fullWidth {...bind("stdCertNos")} /></Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography sx={headStyle}>Instrument Under Test</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}><TextField label="Manufacturer" fullWidth {...bind("mfg")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Model No" fullWidth {...bind("model")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Serial No" fullWidth {...bind("serial")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Instrument Tag" fullWidth {...bind("tag")} /></Grid>
          <Grid item xs={12} md={4}><TextField label={`${isFlow ? "Flowmeter" : "Instrument"} Type`} fullWidth {...bind("type")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Fluid used for calibration" fullWidth {...bind("fluid")} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Nominal size" fullWidth {...bind("nominalSize")} /></Grid>
          <Grid item xs={12} md={8}><TextField label="Operating flow/measurement range" fullWidth {...bind("range")} /></Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography sx={headStyle}>Calibration Environment</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={3}><TextField label="Ambient Temperature" fullWidth {...bind("ambTemp")} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Ambient Pressure" fullWidth {...bind("ambPress")} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Fluid Temperature" fullWidth {...bind("fluidTemp")} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Fluid Pressure" fullWidth {...bind("fluidPress")} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Relative Humidity" fullWidth {...bind("relHumidity")} /></Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={headStyle}>Calibration Results</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={addRow}>Add Row</Button>
            <Button onClick={saveLocal}>Save</Button>
            <Button onClick={loadLocal}>Load</Button>
            <Button onClick={exportCSV}>Export CSV</Button>
          </Stack>
        </Stack>

        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            processRowUpdate={processRowUpdate}
            experimentalFeatures={{ newEditingApi: true }}
            sx={{ borderRadius: 2, "& .MuiDataGrid-columnHeaders": { fontWeight: 700 } }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
