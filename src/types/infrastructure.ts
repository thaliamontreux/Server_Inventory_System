
export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'technician' | 'viewer' | 'auditor' | 'devops';
  jobTitle?: string;
  department?: string;
  onCallStatus?: boolean;
  pagerNumber?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Protocol {
  id: number;
  name: string;
  defaultPort?: number;
  transport: 'TCP' | 'UDP' | 'BOTH';
  description?: string;
}

export interface Credential {
  id: number;
  associatedType: 'vmware_server' | 'virtual_appliance' | 'application' | 'container' | 'url';
  associatedId?: number;
  username?: string;
  password?: string;
  note?: string;
  hiddenDisplay: boolean;
  port?: number;
  protocolId?: number;
  protocol?: Protocol;
  url?: string;
  lastUpdated: string;
}

export interface Note {
  id: number;
  associatedType: string;
  associatedId: number;
  severity: 'info' | 'notice' | 'warning' | 'critical';
  note: string;
  createdBy?: number;
  createdAt: string;
}

export interface VMwareServer {
  id: number;
  hostname?: string;
  ipAddress?: string;
  location?: string;
  datacenter?: string;
  rackPosition?: string;
  vendor?: string;
  model?: string;
  serialNumber?: string;
  assetTag?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  totalCpuCores?: number;
  totalRamGb?: number;
  totalStorageTb?: number;
  cpuModel?: string;
  iloAddress?: string;
  iloCredentialsId?: number;
  esxiVersion?: string;
  biosVersion?: string;
  powerDrawWatts?: number;
  networkZone?: string;
  managementVlan?: string;
  lastAudit?: string;
  createdAt: string;
  credentials?: Credential[];
  notes?: Note[];
  virtualAppliances?: VirtualAppliance[];
}

export interface VirtualAppliance {
  id: number;
  vmwareServerId: number;
  hostname?: string;
  ipAddress?: string;
  fqdn?: string;
  operatingSystem?: string;
  osVersion?: string;
  cpuAllocated?: number;
  ramAllocated?: number;
  diskAllocatedGb?: number;
  macAddress?: string;
  vmwareServer?: VMwareServer;
  credentials?: Credential[];
  notes?: Note[];
  applications?: Application[];
  containers?: Container[];
}

export interface Application {
  id: number;
  virtualApplianceId: number;
  name?: string;
  description?: string;
  type?: string;
  version?: string;
  defaultPorts?: string;
  dependentServices?: string;
  lastUpdated?: string;
  virtualAppliance?: VirtualAppliance;
  credentials?: Credential[];
  notes?: Note[];
  urls?: AppUrl[];
}

export interface AppUrl {
  id: number;
  applicationId: number;
  url?: string;
  port?: number;
  protocolId?: number;
  protocol?: Protocol;
  description?: string;
  isActive: boolean;
}

export interface Container {
  id: number;
  virtualApplianceId: number;
  name?: string;
  image?: string;
  version?: string;
  runtime: 'docker' | 'podman';
  ports?: string;
  volumes?: string;
  environmentVariables?: string;
  credentials?: Credential[];
  notes?: Note[];
}

export interface NetworkInterface {
  id: number;
  applianceId: number;
  interfaceName?: string;
  macAddress?: string;
  ipAddress?: string;
  ipv6Address?: string;
  vlanId?: number;
  mtu?: number;
  linkSpeed?: string;
  jumboFrames?: boolean;
  bondingGroup?: string;
  interfaceAlias?: string;
}

export interface StorageDisk {
  id: number;
  applianceId: number;
  make?: string;
  model?: string;
  serialNumber?: string;
  capacityGb?: number;
  raidLevel?: string;
  smartEnabled?: boolean;
  dateInstalled?: string;
  usagePurpose?: string;
}

export interface Snapshot {
  id: number;
  virtualApplianceId: number;
  snapshotName?: string;
  snapshotDate?: string;
  snapshotType: 'manual' | 'scheduled';
}

export interface MaintenanceEvent {
  id: number;
  associatedType: 'vmware_server' | 'virtual_appliance' | 'application';
  associatedId: number;
  eventType?: string;
  description?: string;
  performedBy?: number;
  eventDate?: string;
}
