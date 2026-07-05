export interface Professional {
	id: string
	name: string
	bio?: string
	photo_url?: string
	status: string
}

export interface Service {
	id: string
	name: string
	price: number
	duration_minutes: number
}

export interface ProfessionalServiceLink {
	professional_id: string
	service_id: string
	custom_price?: number
	custom_duration?: number
}
