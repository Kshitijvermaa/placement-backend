import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Apartment,
  Assessment,
  Badge,
  Description,
  FactCheck,
  Group,
  Insights,
  Layers,
  Timeline,
} from '@mui/icons-material';
import { adminService } from '../../services';

const metricConfig = [
  { key: 'departments', label: 'Departments', icon: <Apartment />, color: '#1976d2', gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' },
  { key: 'batches', label: 'Batches', icon: <Layers />, color: '#388e3c', gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)' },
  { key: 'recruiters', label: 'Recruiters', icon: <Badge />, color: '#f57c00', gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)' },
  { key: 'statuses', label: 'Placement Statuses', icon: <FactCheck />, color: '#7b1fa2', gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)' },
  { key: 'rounds', label: 'Rounds', icon: <Timeline />, color: '#0288d1', gradient: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)' },
  { key: 'results', label: 'Round Results', icon: <Assessment />, color: '#00796b', gradient: 'linear-gradient(135deg, #00796b 0%, #4db6ac 100%)' },
  { key: 'feedback', label: 'Feedback', icon: <Insights />, color: '#5d4037', gradient: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)' },
  { key: 'documents', label: 'Documents', icon: <Description />, color: '#455a64', gradient: 'linear-gradient(135deg, #455a64 0%, #78909c 100%)' },
  { key: 'blacklist', label: 'Blacklist', icon: <Group />, color: '#c62828', gradient: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)' },
];

export default function ExpansionHub() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [overview, setOverview] = useState({});
  const [meta, setMeta] = useState({ companies: [], students: [], offers: [], recruiters: [], rounds: [] });
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [stats, setStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [companyPerf, setCompanyPerf] = useState([]);
  const [reportRows, setReportRows] = useState([]);

  const [departmentForm, setDepartmentForm] = useState({ code: '', name: '' });
  const [batchForm, setBatchForm] = useState({ batch_label: '', start_year: '', end_year: '', graduation_year: '' });
  const [recruiterForm, setRecruiterForm] = useState({ company_id: '', name: '', email: '', phone: '', designation: '' });
  const [roundForm, setRoundForm] = useState({ offer_id: '', round_number: '', type: 'technical', scheduled_at: '', duration_minutes: '', max_students: '' });
  const [resultForm, setResultForm] = useState({ application_id: '', round_id: '', result: 'pending', score: '', remarks: '' });
  const [feedbackForm, setFeedbackForm] = useState({ application_id: '', recruiter_id: '', rating: 4, comments: '' });
  const [documentForm, setDocumentForm] = useState({ student_id: '', doc_type: 'resume', version_no: 1, file_path: '', verified: false });
  const [blacklistForm, setBlacklistForm] = useState({ student_id: '', reason: '', expires_at: '' });
  const [procedureForm, setProcedureForm] = useState({ offer_id: '', round_number: '' });
  const [bulkRejectOfferId, setBulkRejectOfferId] = useState('');
  const [reportFilter, setReportFilter] = useState({ branch_code: 'CSE', year: '2026' });

  const applicationsForForms = useMemo(
    () => results.map((r) => ({ id: r.application_id, label: `${r.student_name} • ${r.offer_title}` })).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i),
    [results]
  );

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        ov, mt, deps, bts, recs, sts, rnds, rrs, fb, docs, bl, ps, lb, pl, cp,
      ] = await Promise.all([
        adminService.getExpansionOverview(),
        adminService.getExpansionMeta(),
        adminService.getDepartments(),
        adminService.getBatches(),
        adminService.getRecruiters(),
        adminService.getPlacementStatuses(),
        adminService.getPlacementRounds(),
        adminService.getRoundResults(),
        adminService.getFeedback(),
        adminService.getDocuments(),
        adminService.getBlacklist(),
        adminService.getPlacementStats(),
        adminService.getLeaderboard(),
        adminService.getPipeline(),
        adminService.getCompanyPerformance(),
      ]);
      setOverview(ov);
      setMeta(mt);
      setDepartments(deps);
      setBatches(bts);
      setRecruiters(recs);
      setStatuses(sts);
      setRounds(rnds);
      setResults(rrs);
      setFeedback(fb);
      setDocuments(docs);
      setBlacklist(bl);
      setStats(ps);
      setLeaderboard(lb);
      setPipeline(pl);
      setCompanyPerf(cp);
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to load expansion data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async (fn, successMessage) => {
    try {
      await fn();
      showMessage('success', successMessage);
      await loadAll();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Operation failed');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          mb: 0.5
        }}>
          Expansion Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Advanced features • Normalized tables • SQL analytics • Stored procedures
        </Typography>
      </Box>

      {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {metricConfig.map((m) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={m.key}>
            <Card 
              elevation={3}
              sx={{ 
                background: m.gradient,
                color: 'white',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: 6 
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box sx={{ opacity: 0.9 }}>{m.icon}</Box>
                  <Typography variant="h4" fontWeight={800}>
                    {overview[m.key] ?? 0}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                  {m.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }} elevation={2}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          variant="scrollable" 
          scrollButtons
          sx={{
            '& .MuiTab-root': { 
              fontWeight: 600, 
              textTransform: 'none', 
              fontSize: '0.95rem',
              minHeight: 56
            }
          }}
        >
          <Tab label="📚 Catalog & Setup" />
          <Tab label="📊 Recruitment Flow" />
          <Tab label="📄 Documents & Feedback" />
          <Tab label="📈 Analytics & SQL Features" />
        </Tabs>
      </Paper>

      {loading ? <Typography>Loading...</Typography> : (
        <>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={4}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight={600} mb={2} color="primary.main">
                    🏢 Add Department
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TextField 
                    label="Code" 
                    size="small" 
                    fullWidth 
                    sx={{ mt: 1 }} 
                    value={departmentForm.code} 
                    onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value.toUpperCase() })} 
                    placeholder="e.g., CSE, ECE"
                  />
                  <TextField 
                    label="Name" 
                    size="small" 
                    fullWidth 
                    sx={{ mt: 2 }} 
                    value={departmentForm.name} 
                    onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} 
                    placeholder="e.g., Computer Science"
                  />
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ mt: 2 }} 
                    disabled={!departmentForm.code || !departmentForm.name}
                    onClick={() => submit(() => adminService.createDepartment(departmentForm), 'Department added')}
                  >
                    Create Department
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight={600} mb={2} color="success.main">
                    📅 Add Academic Batch
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TextField 
                    label="Batch Label" 
                    size="small" 
                    fullWidth 
                    sx={{ mt: 1 }} 
                    value={batchForm.batch_label} 
                    onChange={(e) => setBatchForm({ ...batchForm, batch_label: e.target.value })} 
                    placeholder="e.g., 2023-24"
                  />
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <TextField 
                        label="Start" 
                        size="small" 
                        type="number" 
                        fullWidth 
                        value={batchForm.start_year} 
                        onChange={(e) => setBatchForm({ ...batchForm, start_year: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField 
                        label="End" 
                        size="small" 
                        type="number" 
                        fullWidth 
                        value={batchForm.end_year} 
                        onChange={(e) => setBatchForm({ ...batchForm, end_year: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField 
                        label="Grad" 
                        size="small" 
                        type="number" 
                        fullWidth 
                        value={batchForm.graduation_year} 
                        onChange={(e) => setBatchForm({ ...batchForm, graduation_year: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
                  <Button 
                    variant="contained" 
                    color="success"
                    fullWidth
                    sx={{ mt: 2 }} 
                    disabled={!batchForm.batch_label}
                    onClick={() => submit(() => adminService.createBatch(batchForm), 'Batch added')}
                  >
                    Create Batch
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight={600} mb={2} color="warning.main">
                    👤 Add Recruiter
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Company</InputLabel>
                    <Select label="Company" value={recruiterForm.company_id} onChange={(e) => setRecruiterForm({ ...recruiterForm, company_id: e.target.value })}>
                      {meta.companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Name" size="small" fullWidth sx={{ mt: 2 }} value={recruiterForm.name} onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })} />
                  <TextField label="Email" size="small" fullWidth sx={{ mt: 2 }} value={recruiterForm.email} onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })} />
                  <TextField label="Phone" size="small" fullWidth sx={{ mt: 2 }} value={recruiterForm.phone} onChange={(e) => setRecruiterForm({ ...recruiterForm, phone: e.target.value })} />
                  <Button 
                    variant="contained" 
                    color="warning"
                    fullWidth
                    sx={{ mt: 2 }} 
                    disabled={!recruiterForm.company_id || !recruiterForm.name}
                    onClick={() => submit(() => adminService.createRecruiter(recruiterForm), 'Recruiter added')}
                  >
                    Create Recruiter
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>Departments & Batches Data</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" fontWeight={600} mb={1.5}>
                        Departments ({departments.length})
                      </Typography>
                      <TableContainer sx={{ maxHeight: 320, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Code</TableCell>
                              <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Name</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {departments.map((d) => (
                              <TableRow key={d.id} hover>
                                <TableCell><Chip label={d.code} size="small" color="primary" variant="outlined" /></TableCell>
                                <TableCell>{d.name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="success.main" fontWeight={600} mb={1.5}>
                        Batches ({batches.length})
                      </Typography>
                      <TableContainer sx={{ maxHeight: 320, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, bgcolor: 'success.main', color: 'white' }}>Batch</TableCell>
                              <TableCell sx={{ fontWeight: 700, bgcolor: 'success.main', color: 'white' }}>Years</TableCell>
                              <TableCell sx={{ fontWeight: 700, bgcolor: 'success.main', color: 'white' }}>Grad</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {batches.map((b) => (
                              <TableRow key={b.id} hover>
                                <TableCell><Chip label={b.batch_label} size="small" color="success" variant="outlined" /></TableCell>
                                <TableCell>{b.start_year}-{b.end_year}</TableCell>
                                <TableCell><strong>{b.graduation_year}</strong></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Add Placement Round</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Offer</InputLabel>
                    <Select value={roundForm.offer_id} label="Offer" onChange={(e) => setRoundForm({ ...roundForm, offer_id: e.target.value })}>
                      {meta.offers.map((o) => <MenuItem key={o.id} value={o.id}>{o.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={4}><TextField label="Round #" size="small" type="number" fullWidth value={roundForm.round_number} onChange={(e) => setRoundForm({ ...roundForm, round_number: e.target.value })} /></Grid>
                    <Grid item xs={8}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={roundForm.type} label="Type" onChange={(e) => setRoundForm({ ...roundForm, type: e.target.value })}>
                          {['aptitude', 'technical', 'hr', 'group_discussion', 'case_study'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <TextField label="Scheduled At" type="datetime-local" size="small" fullWidth sx={{ mt: 1 }} InputLabelProps={{ shrink: true }} value={roundForm.scheduled_at} onChange={(e) => setRoundForm({ ...roundForm, scheduled_at: e.target.value })} />
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => submit(() => adminService.createPlacementRound(roundForm), 'Round created')}>Create</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Save Round Result</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Application</InputLabel>
                    <Select value={resultForm.application_id} label="Application" onChange={(e) => setResultForm({ ...resultForm, application_id: e.target.value })}>
                      {applicationsForForms.map((a) => <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Round</InputLabel>
                    <Select value={resultForm.round_id} label="Round" onChange={(e) => setResultForm({ ...resultForm, round_id: e.target.value })}>
                      {meta.rounds.map((r) => <MenuItem key={r.id} value={r.id}>R{r.round_number} {r.type} • {r.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Result</InputLabel>
                        <Select value={resultForm.result} label="Result" onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}>
                          {['pending', 'pass', 'fail'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}><TextField label="Score" type="number" size="small" fullWidth value={resultForm.score} onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} /></Grid>
                  </Grid>
                  <TextField label="Remarks" size="small" fullWidth sx={{ mt: 1 }} value={resultForm.remarks} onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })} />
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => submit(() => adminService.saveRoundResult(resultForm), 'Round result saved')}>Save</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Blacklist Student</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Student</InputLabel>
                    <Select value={blacklistForm.student_id} label="Student" onChange={(e) => setBlacklistForm({ ...blacklistForm, student_id: e.target.value })}>
                      {meta.students.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.reg_number})</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Reason" size="small" fullWidth sx={{ mt: 1 }} value={blacklistForm.reason} onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })} />
                  <TextField label="Expires At" type="date" size="small" fullWidth sx={{ mt: 1 }} InputLabelProps={{ shrink: true }} value={blacklistForm.expires_at} onChange={(e) => setBlacklistForm({ ...blacklistForm, expires_at: e.target.value })} />
                  <Button variant="contained" color="error" sx={{ mt: 1 }} onClick={() => submit(() => adminService.createBlacklist(blacklistForm), 'Student blacklisted')}>Blacklist</Button>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Placement Statuses</Typography>
                  <Divider sx={{ my: 1 }} />
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Reg No</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
                      <TableBody>
                        {statuses.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.reg_number}</TableCell>
                            <TableCell><Chip size="small" label={s.status} /></TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 160 }}>
                                <Select value={s.status} onChange={(e) => submit(() => adminService.updatePlacementStatus(s.id, e.target.value), 'Placement status updated')}>
                                  {['not_placed', 'placed', 'higher_studies', 'entrepreneurship', 'inactive'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                                </Select>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Add Feedback</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Application</InputLabel>
                    <Select value={feedbackForm.application_id} label="Application" onChange={(e) => setFeedbackForm({ ...feedbackForm, application_id: e.target.value })}>
                      {applicationsForForms.map((a) => <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Recruiter</InputLabel>
                    <Select value={feedbackForm.recruiter_id} label="Recruiter" onChange={(e) => setFeedbackForm({ ...feedbackForm, recruiter_id: e.target.value })}>
                      {meta.recruiters.map((r) => <MenuItem key={r.id} value={r.id}>{r.name} • {r.company_name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Rating (1-5)" type="number" size="small" fullWidth sx={{ mt: 1 }} value={feedbackForm.rating} onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })} />
                  <TextField label="Comments" size="small" fullWidth sx={{ mt: 1 }} value={feedbackForm.comments} onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} />
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => submit(() => adminService.saveFeedback(feedbackForm), 'Feedback saved')}>Save</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Add Document Entry</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Student</InputLabel>
                    <Select value={documentForm.student_id} label="Student" onChange={(e) => setDocumentForm({ ...documentForm, student_id: e.target.value })}>
                      {meta.students.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.reg_number})</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Doc Type</InputLabel>
                    <Select value={documentForm.doc_type} label="Doc Type" onChange={(e) => setDocumentForm({ ...documentForm, doc_type: e.target.value })}>
                      {['resume', 'noc', 'offer_letter', 'id_proof', 'transcript', 'other'].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Version" type="number" size="small" fullWidth sx={{ mt: 1 }} value={documentForm.version_no} onChange={(e) => setDocumentForm({ ...documentForm, version_no: e.target.value })} />
                  <TextField label="File Path" size="small" fullWidth sx={{ mt: 1 }} value={documentForm.file_path} onChange={(e) => setDocumentForm({ ...documentForm, file_path: e.target.value })} />
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => submit(() => adminService.createDocument(documentForm), 'Document entry created')}>Save</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Blacklist Control</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Deactivate active blacklist entries quickly.</Typography>
                  {blacklist.slice(0, 8).map((b) => (
                    <Box key={b.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                      <Typography variant="body2">{b.student_name} ({b.reg_number})</Typography>
                      {b.active ? (
                        <Button size="small" color="error" onClick={() => submit(() => adminService.deactivateBlacklist(b.id), 'Blacklist entry deactivated')}>Deactivate</Button>
                      ) : (
                        <Chip size="small" label="inactive" />
                      )}
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Feedback</Typography>
                  <TableContainer sx={{ maxHeight: 280 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Offer</TableCell><TableCell>Rating</TableCell></TableRow></TableHead>
                      <TableBody>{feedback.map((f) => <TableRow key={f.id}><TableCell>{f.student_name}</TableCell><TableCell>{f.offer_title}</TableCell><TableCell>{f.rating}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Documents</Typography>
                  <TableContainer sx={{ maxHeight: 280 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Type</TableCell><TableCell>Version</TableCell><TableCell>Verified</TableCell></TableRow></TableHead>
                      <TableBody>{documents.map((d) => <TableRow key={d.id}><TableCell>{d.student_name}</TableCell><TableCell>{d.doc_type}</TableCell><TableCell>{d.version_no}</TableCell><TableCell><Chip size="small" label={d.verified ? 'yes' : 'no'} color={d.verified ? 'success' : 'default'} /></TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tab === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Procedures</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Offer</InputLabel>
                    <Select value={procedureForm.offer_id} label="Offer" onChange={(e) => setProcedureForm({ ...procedureForm, offer_id: e.target.value })}>
                      {meta.offers.map((o) => <MenuItem key={o.id} value={o.id}>{o.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Current Round #" type="number" size="small" fullWidth sx={{ mt: 1 }} value={procedureForm.round_number} onChange={(e) => setProcedureForm({ ...procedureForm, round_number: e.target.value })} />
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => submit(() => adminService.advanceRound(procedureForm.offer_id, procedureForm.round_number), 'Advanced to next round')}>Advance Round</Button>
                  <Divider sx={{ my: 2 }} />
                  <FormControl fullWidth size="small">
                    <InputLabel>Offer to Bulk Reject</InputLabel>
                    <Select value={bulkRejectOfferId} label="Offer to Bulk Reject" onChange={(e) => setBulkRejectOfferId(e.target.value)}>
                      {meta.offers.map((o) => <MenuItem key={o.id} value={o.id}>{o.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Button color="error" variant="contained" sx={{ mt: 1 }} onClick={() => submit(() => adminService.bulkRejectOffer(bulkRejectOfferId), 'Bulk reject executed')}>Bulk Reject Pending</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Branch Report</Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Branch</InputLabel>
                        <Select value={reportFilter.branch_code} label="Branch" onChange={(e) => setReportFilter({ ...reportFilter, branch_code: e.target.value })}>
                          {departments.map((d) => <MenuItem key={d.id} value={d.code}>{d.code}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Year" type="number" size="small" fullWidth value={reportFilter.year} onChange={(e) => setReportFilter({ ...reportFilter, year: e.target.value })} />
                    </Grid>
                  </Grid>
                  <Button variant="contained" sx={{ mt: 1 }} onClick={async () => {
                    try {
                      const rows = await adminService.getBranchReport(reportFilter.branch_code, reportFilter.year);
                      setReportRows(rows);
                    } catch (err) {
                      showMessage('error', err.response?.data?.error || 'Failed to generate report');
                    }
                  }}>Generate</Button>
                  <Box sx={{ mt: 2 }}>
                    {reportRows.map((r, i) => <Typography key={i} variant="body2">{Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(' • ')}</Typography>)}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Placement Stats</Typography>
                  <TableContainer sx={{ maxHeight: 270 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Dept</TableCell><TableCell>Batch</TableCell><TableCell>Placed</TableCell><TableCell>Rate</TableCell></TableRow></TableHead>
                      <TableBody>{stats.map((s, i) => <TableRow key={i}><TableCell>{s.department_code}</TableCell><TableCell>{s.batch_label}</TableCell><TableCell>{s.total_placed}/{s.total_students}</TableCell><TableCell>{s.placement_rate}%</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Leaderboard View</Typography>
                  <TableContainer sx={{ maxHeight: 260 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Branch</TableCell><TableCell>Rank</TableCell></TableRow></TableHead>
                      <TableBody>{leaderboard.slice(0, 30).map((r) => <TableRow key={r.student_id}><TableCell>{r.name}</TableCell><TableCell>{r.branch_code}</TableCell><TableCell>#{r.overall_rank}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Offer Pipeline View</Typography>
                  <TableContainer sx={{ maxHeight: 260 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Offer</TableCell><TableCell>Total</TableCell><TableCell>Selected</TableCell></TableRow></TableHead>
                      <TableBody>{pipeline.map((p) => <TableRow key={p.offer_id}><TableCell>{p.title}</TableCell><TableCell>{p.total_applications}</TableCell><TableCell>{p.selected_count}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Company Performance View</Typography>
                  <TableContainer sx={{ maxHeight: 260 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Company</TableCell><TableCell>Apps</TableCell><TableCell>Conv.</TableCell></TableRow></TableHead>
                      <TableBody>{companyPerf.map((c) => <TableRow key={c.company_id}><TableCell>{c.company_name}</TableCell><TableCell>{c.total_applications}</TableCell><TableCell>{c.conversion_rate ?? 0}%</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}
