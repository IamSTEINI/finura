export interface TeamPermissions {
	create: boolean;
	delete: boolean;
}

export interface InvoicePermissions {
	create: boolean;
	delete: boolean;
	archive: boolean;
	restore: boolean;
	discount: boolean;
	view: boolean;
}

export interface CustomerPermissions {
	add: boolean;
	delete: boolean;
	edit: boolean;
	viewHistory: boolean;
	view: boolean;
}

export interface ReceiptPermissions {
	add: boolean;
	delete: boolean;
	view: boolean;
}

export interface ChatPermissions {
	view: boolean;
	send: boolean;
	sendImages: boolean;
	delete: boolean;
}

export interface AppointmentPermissions {
	create: boolean;
	delete: boolean;
	edit: boolean;
	assign: boolean;
	view: boolean;
}

export interface ProductPermissions {
	view: boolean;
	create: boolean;
	edit: boolean;
	remove: boolean;
	viewStockLevels: boolean;
	adjustStockLevels: boolean;
}

export interface RolePermissions {
	create: boolean;
	remove: boolean;
	edit: boolean;
	assign: boolean;
	view: boolean;
}

export interface AuditLogPermissions {
	viewUser: boolean;
	viewSystem: boolean;
	download: boolean;
}

export interface ProfilePermissions {
	changePicture: boolean;
	changeNickname: boolean;
	changePassword: boolean;
}

export interface SystemPermissions {
	exportData: boolean;
	createUsers: boolean;
	removeUsers: boolean;
	suspendUsers: boolean;
	editSettings: boolean;
	backupData: boolean;
	viewStatus: boolean;
	restartServices: boolean;
	manageIntegrations: boolean;
	isSystemRole: boolean;
	admin: boolean;
}

export interface Permissions {
	teams: TeamPermissions;
	invoices: InvoicePermissions;
	customers: CustomerPermissions;
	receipts: ReceiptPermissions;
	chat: ChatPermissions;
	appointments: AppointmentPermissions;
	analytics: {
		view: boolean;
	};
	products: ProductPermissions;
	roles: RolePermissions;
	auditLogs: AuditLogPermissions;
	profile: ProfilePermissions;
	system: SystemPermissions;
}

export interface Permissions {
	teams: TeamPermissions;
	invoices: InvoicePermissions;
	customers: CustomerPermissions;
	receipts: ReceiptPermissions;
	chat: ChatPermissions;
	appointments: AppointmentPermissions;
	analytics: {
		view: boolean;
	};
	products: ProductPermissions;
	roles: RolePermissions;
	auditLogs: AuditLogPermissions;
	profile: ProfilePermissions;
	system: SystemPermissions;
}

// Permissions are just a general permission of something, the admins also will be able to add specific roles to something

export interface Role {
  id: number;
  name: string;
  color: string;
  permissions: Permissions;
}

export const DEFAULT_PERMISSIONS: Permissions = {
  teams: {
    create: false,
    delete: false,
  },
  invoices: {
    create: true,
    delete: false,
    archive: false,
    restore: false,
    discount: false,
    view: true,
  },
  customers: {
    add: true,
    delete: false,
    edit: true,
    viewHistory: false,
    view: true,
  },
  receipts: {
    add: true,
    delete: false,
    view: true,
  },
  chat: {
    view: true,
    send: true,
    sendImages: true,
    delete: false,
  },
  appointments: {
    create: true,
    delete: false,
    edit: true,
    assign: false,
    view: true,
  },
  analytics: {
    view: false,
  },
  products: {
    view: true,
    create: false,
    edit: false,
    remove: false,
    viewStockLevels: true,
    adjustStockLevels: false,
  },
  roles: {
    create: false,
    remove: false,
    edit: false,
    assign: false,
    view: false,
  },
  auditLogs: {
    viewUser: false,
    viewSystem: false,
    download: false,
  },
  profile: {
    changePicture: true,
    changeNickname: true,
    changePassword: true,
  },
  system: {
    exportData: false,
    createUsers: false,
    removeUsers: false,
    suspendUsers: false,
    editSettings: false,
    backupData: false,
    viewStatus: false,
    restartServices: false,
    manageIntegrations: false,
    isSystemRole: false,
    admin: false,
  },
};