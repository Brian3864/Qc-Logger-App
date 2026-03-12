// src/components/LoginPage.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert
} from "@mui/material";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Save extra info for audits / 3rd-party usage
        await setDoc(doc(db, "users", cred.user.uid), {
          name,
          email,
          role: "technician",
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5"
      }}
    >
      <Paper sx={{ p: 4, width: 420 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          QC Logger – Sign in
        </Typography>

        <Tabs
          value={mode}
          onChange={(_, v) => setMode(v)}
          sx={{ mb: 2 }}
          variant="fullWidth"
        >
          <Tab label="Login" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <TextField
              label="Full name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            {mode === "login" ? "Login" : "Create account"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
