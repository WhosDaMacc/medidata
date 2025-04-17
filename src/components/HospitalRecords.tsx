import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  admissionDate: string;
  diagnosis: string;
  treatment: string;
  status: 'Active' | 'Discharged' | 'Critical';
  doctor: string;
  room: string;
  notes: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  contact: string;
  schedule: string[];
}

interface Room {
  id: string;
  number: string;
  type: 'General' | 'ICU' | 'Private';
  status: 'Available' | 'Occupied' | 'Maintenance';
  capacity: number;
}

interface AccessToken {
  id: string;
  patientId: string;
  doctorId: string;
  permissions: ('view' | 'edit' | 'prescribe')[];
  expiryDate: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'checkup' | 'consultation' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string;
  refills: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface MedicalImage {
  id: string;
  patientId: string;
  type: 'MRI' | 'CT' | 'X-Ray' | 'Ultrasound';
  date: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string;
  metadata: {
    resolution: string;
    size: string;
    format: string;
  };
  accessTokens: string[];
}

interface CriticalData {
  id: string;
  patientId: string;
  type: 'Lab Results' | 'Vital Signs' | 'Diagnostic Reports' | 'Treatment Plans';
  date: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Resolved' | 'Monitoring';
  attachments: {
    name: string;
    type: string;
    url: string;
  }[];
  accessTokens: string[];
}

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 15px;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  background: ${props => {
    switch (props.status) {
      case 'Active': return '#4CAF50';
      case 'Discharged': return '#2196F3';
      case 'Critical': return '#F44336';
      case 'Available': return '#4CAF50';
      case 'Occupied': return '#F44336';
      case 'Maintenance': return '#FFC107';
      default: return '#666';
    }
  }};
  color: white;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  
  &:hover {
    background: #45a049;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  min-height: 100px;
`;

const TokenBadge = styled.span<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  background: ${props => props.active ? '#4CAF50' : '#F44336'};
  color: white;
  margin-left: 10px;
`;

const TokenContainer = styled.div`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  margin: 10px 0;
  word-break: break-all;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
`;

const ImageCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ImageThumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const CriticalDataCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  background: ${props => {
    switch (props.priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FFC107';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  }};
  color: white;
  margin-left: 10px;
`;

const HospitalRecords: React.FC = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalImages, setMedicalImages] = useState<MedicalImage[]>([]);
  const [criticalData, setCriticalData] = useState<CriticalData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showCriticalDataForm, setShowCriticalDataForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  // Load initial data
  useEffect(() => {
    // Simulated data - in a real app, this would come from an API
    const initialPatients: PatientRecord[] = [
      {
        id: '1',
        name: 'John Doe',
        age: 45,
        gender: 'Male',
        admissionDate: '2024-03-15',
        diagnosis: 'Hypertension',
        treatment: 'Medication',
        status: 'Active',
        doctor: 'Dr. Smith',
        room: '101',
        notes: ['Regular checkup needed', 'Blood pressure monitoring']
      }
    ];

    const initialDoctors: Doctor[] = [
      {
        id: '1',
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        contact: '555-1234',
        schedule: ['Mon-Fri: 9AM-5PM']
      }
    ];

    const initialRooms: Room[] = [
      {
        id: '1',
        number: '101',
        type: 'General',
        status: 'Occupied',
        capacity: 2
      }
    ];

    setPatients(initialPatients);
    setDoctors(initialDoctors);
    setRooms(initialRooms);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.includes(searchTerm)
  );

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for adding a new patient
  };

  const handleUpdatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for updating a patient
  };

  const generateToken = (patientId: string, doctorId: string, permissions: ('view' | 'edit' | 'prescribe')[]) => {
    const newToken: AccessToken = {
      id: Math.random().toString(36).substr(2, 9),
      patientId,
      doctorId,
      permissions,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      isActive: true
    };
    setTokens(prev => [...prev, newToken]);
    return newToken;
  };

  const revokeToken = (tokenId: string) => {
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, isActive: false } : token
    ));
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for adding a new appointment
  };

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for adding a new prescription
  };

  const handleImageUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for image upload
  };

  const handleCriticalDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for critical data submission
  };

  const shareImage = (imageId: string, tokenId: string) => {
    setMedicalImages(prev => prev.map(image => 
      image.id === imageId 
        ? { ...image, accessTokens: [...image.accessTokens, tokenId] }
        : image
    ));
  };

  const shareCriticalData = (dataId: string, tokenId: string) => {
    setCriticalData(prev => prev.map(data => 
      data.id === dataId 
        ? { ...data, accessTokens: [...data.accessTokens, tokenId] }
        : data
    ));
  };

  return (
    <Container>
      <Title>Hospital Records Management</Title>
      
      <SearchBar
        type="text"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <Button onClick={() => setShowForm(true)}>Add New Patient</Button>

      <Grid>
        {/* Patients List */}
        <Card>
          <Title>Patients</Title>
          {filteredPatients.map(patient => (
            <div key={patient.id} style={{ marginBottom: '15px' }}>
              <h3>{patient.name}</h3>
              <p>ID: {patient.id}</p>
              <p>Age: {patient.age}</p>
              <p>Diagnosis: {patient.diagnosis}</p>
              <StatusBadge status={patient.status}>{patient.status}</StatusBadge>
              <Button onClick={() => setSelectedPatient(patient)}>View Details</Button>
            </div>
          ))}
        </Card>

        {/* Doctors List */}
        <Card>
          <Title>Doctors</Title>
          {doctors.map(doctor => (
            <div key={doctor.id} style={{ marginBottom: '15px' }}>
              <h3>{doctor.name}</h3>
              <p>Specialization: {doctor.specialization}</p>
              <p>Contact: {doctor.contact}</p>
            </div>
          ))}
        </Card>

        {/* Rooms Status */}
        <Card>
          <Title>Rooms</Title>
          {rooms.map(room => (
            <div key={room.id} style={{ marginBottom: '15px' }}>
              <h3>Room {room.number}</h3>
              <p>Type: {room.type}</p>
              <p>Capacity: {room.capacity}</p>
              <StatusBadge status={room.status}>{room.status}</StatusBadge>
            </div>
          ))}
        </Card>

        {/* Token Management */}
        <Card>
          <Title>Access Tokens</Title>
          <Button onClick={() => setShowTokenForm(true)}>Generate New Token</Button>
          {tokens.map(token => (
            <TokenContainer key={token.id}>
              <div>
                <strong>Token ID:</strong> {token.id}
                <TokenBadge active={token.isActive}>
                  {token.isActive ? 'Active' : 'Revoked'}
                </TokenBadge>
              </div>
              <div><strong>Expires:</strong> {new Date(token.expiryDate).toLocaleDateString()}</div>
              <div><strong>Permissions:</strong> {token.permissions.join(', ')}</div>
              {token.isActive && (
                <Button onClick={() => revokeToken(token.id)}>Revoke Token</Button>
              )}
            </TokenContainer>
          ))}
        </Card>

        {/* Appointments */}
        <Card>
          <Title>Appointments</Title>
          <Button onClick={() => setShowAppointmentForm(true)}>Schedule Appointment</Button>
          <ScheduleGrid>
            {appointments.map(appointment => (
              <div key={appointment.id} style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
                <h4>{new Date(appointment.date).toLocaleDateString()}</h4>
                <p>Time: {appointment.time}</p>
                <p>Type: {appointment.type}</p>
                <StatusBadge status={appointment.status}>{appointment.status}</StatusBadge>
              </div>
            ))}
          </ScheduleGrid>
        </Card>

        {/* Prescriptions */}
        <Card>
          <Title>Prescriptions</Title>
          <Button onClick={() => setShowPrescriptionForm(true)}>Add Prescription</Button>
          {prescriptions.map(prescription => (
            <PrescriptionCard key={prescription.id}>
              <h4>Prescription #{prescription.id}</h4>
              <p>Date: {new Date(prescription.date).toLocaleDateString()}</p>
              <div>
                <strong>Medications:</strong>
                {prescription.medications.map((med, index) => (
                  <div key={index}>
                    {med.name} - {med.dosage} ({med.frequency}) for {med.duration}
                  </div>
                ))}
              </div>
              <p><strong>Instructions:</strong> {prescription.instructions}</p>
              <p><strong>Refills:</strong> {prescription.refills}</p>
              <StatusBadge status={prescription.status}>{prescription.status}</StatusBadge>
            </PrescriptionCard>
          ))}
        </Card>

        {/* Medical Images */}
        <Card>
          <Title>Medical Images</Title>
          <Button onClick={() => setShowImageUpload(true)}>Upload New Image</Button>
          <ImageGrid>
            {medicalImages.map(image => (
              <ImageCard key={image.id}>
                <ImageThumbnail src={image.thumbnailUrl} alt={image.description} />
                <div style={{ padding: '10px' }}>
                  <h4>{image.type}</h4>
                  <p>{new Date(image.date).toLocaleDateString()}</p>
                  <p>{image.description}</p>
                  <div>
                    <strong>Access Tokens:</strong>
                    {image.accessTokens.map(tokenId => (
                      <TokenBadge key={tokenId} active={true}>{tokenId}</TokenBadge>
                    ))}
                  </div>
                  <Button onClick={() => {/* View full image */}}>View Full Image</Button>
                  <Button onClick={() => {/* Share image */}}>Share</Button>
                </div>
              </ImageCard>
            ))}
          </ImageGrid>
        </Card>

        {/* Critical Data */}
        <Card>
          <Title>Critical Data</Title>
          <Button onClick={() => setShowCriticalDataForm(true)}>Add Critical Data</Button>
          {criticalData.map(data => (
            <CriticalDataCard key={data.id}>
              <h4>{data.type}</h4>
              <p>Date: {new Date(data.date).toLocaleDateString()}</p>
              <PriorityBadge priority={data.priority}>{data.priority}</PriorityBadge>
              <StatusBadge status={data.status}>{data.status}</StatusBadge>
              <p>{data.content}</p>
              {data.attachments.map((attachment, index) => (
                <div key={index}>
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    {attachment.name}
                  </a>
                </div>
              ))}
              <div>
                <strong>Access Tokens:</strong>
                {data.accessTokens.map(tokenId => (
                  <TokenBadge key={tokenId} active={true}>{tokenId}</TokenBadge>
                ))}
              </div>
              <Button onClick={() => {/* Share data */}}>Share</Button>
            </CriticalDataCard>
          ))}
        </Card>
      </Grid>

      {/* Patient Form */}
      {showForm && (
        <Card style={{ marginTop: '20px' }}>
          <Title>{selectedPatient ? 'Update Patient' : 'Add New Patient'}</Title>
          <Form onSubmit={selectedPatient ? handleUpdatePatient : handleAddPatient}>
            <Input type="text" placeholder="Name" required />
            <Input type="number" placeholder="Age" required />
            <Input type="text" placeholder="Gender" required />
            <Input type="text" placeholder="Diagnosis" required />
            <Input type="text" placeholder="Treatment" required />
            <Input type="text" placeholder="Doctor" required />
            <Input type="text" placeholder="Room" required />
            <TextArea placeholder="Notes" />
            <Button type="submit">Save</Button>
            <Button type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </Form>
        </Card>
      )}

      {/* Token Generation Form */}
      {showTokenForm && (
        <Card>
          <Title>Generate Access Token</Title>
          <Form onSubmit={(e) => {
            e.preventDefault();
            // Implementation for token generation
            setShowTokenForm(false);
          }}>
            <Input type="text" placeholder="Patient ID" required />
            <Input type="text" placeholder="Doctor ID" required />
            <div>
              <label>
                <input type="checkbox" name="permissions" value="view" /> View Records
              </label>
              <label>
                <input type="checkbox" name="permissions" value="edit" /> Edit Records
              </label>
              <label>
                <input type="checkbox" name="permissions" value="prescribe" /> Prescribe Medications
              </label>
            </div>
            <Button type="submit">Generate Token</Button>
            <Button type="button" onClick={() => setShowTokenForm(false)}>Cancel</Button>
          </Form>
        </Card>
      )}

      {/* Appointment Form */}
      {showAppointmentForm && (
        <Card>
          <Title>Schedule Appointment</Title>
          <Form onSubmit={handleAddAppointment}>
            <Input type="date" required />
            <Input type="time" required />
            <select required>
              <option value="checkup">Checkup</option>
              <option value="consultation">Consultation</option>
              <option value="emergency">Emergency</option>
            </select>
            <TextArea placeholder="Notes" />
            <Button type="submit">Schedule</Button>
            <Button type="button" onClick={() => setShowAppointmentForm(false)}>Cancel</Button>
          </Form>
        </Card>
      )}

      {/* Prescription Form */}
      {showPrescriptionForm && (
        <Card>
          <Title>Add Prescription</Title>
          <Form onSubmit={handleAddPrescription}>
            <Input type="text" placeholder="Medication Name" required />
            <Input type="text" placeholder="Dosage" required />
            <Input type="text" placeholder="Frequency" required />
            <Input type="text" placeholder="Duration" required />
            <Input type="number" placeholder="Number of Refills" required />
            <TextArea placeholder="Instructions" required />
            <Button type="submit">Add Prescription</Button>
            <Button type="button" onClick={() => setShowPrescriptionForm(false)}>Cancel</Button>
          </Form>
        </Card>
      )}

      {/* Image Upload Form */}
      {showImageUpload && (
        <Card>
          <Title>Upload Medical Image</Title>
          <Form onSubmit={handleImageUpload}>
            <select required>
              <option value="MRI">MRI</option>
              <option value="CT">CT Scan</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
            <Input type="file" accept="image/*" required />
            <Input type="text" placeholder="Description" required />
            <TextArea placeholder="Additional Notes" />
            <Button type="submit">Upload</Button>
            <Button type="button" onClick={() => setShowImageUpload(false)}>Cancel</Button>
          </Form>
        </Card>
      )}

      {/* Critical Data Form */}
      {showCriticalDataForm && (
        <Card>
          <Title>Add Critical Data</Title>
          <Form onSubmit={handleCriticalDataSubmit}>
            <select required>
              <option value="Lab Results">Lab Results</option>
              <option value="Vital Signs">Vital Signs</option>
              <option value="Diagnostic Reports">Diagnostic Reports</option>
              <option value="Treatment Plans">Treatment Plans</option>
            </select>
            <select required>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <TextArea placeholder="Content" required />
            <Input type="file" multiple />
            <Button type="submit">Submit</Button>
            <Button type="button" onClick={() => setShowCriticalDataForm(false)}>Cancel</Button>
          </Form>
        </Card>
      )}
    </Container>
  );
};

export default HospitalRecords; 