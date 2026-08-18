export const translations = {
	en: {
		// Common / shared
		common: {
			back: 'Back',
			cancel: 'Cancel',
			close: 'Close',
			save: 'Save',
			delete: 'Delete',
			edit: 'Edit',
			loading: 'Loading...',
			saving: 'Saving...',
			saved: 'Saved',
			optional: 'optional',
			logOut: 'Log out',
			dashboard: 'Dashboard'
		},

		// Login / Register
		login: {
			signIn: 'Sign In',
			createAccount: 'Create Account',
			tagline: 'AI Paper Generator',
			email: 'Email',
			password: 'Password',
			emailPlaceholder: 'name@email.com',
			passwordPlaceholder: 'At least 6 characters',
			processing: 'Processing...',
			signUp: 'Sign Up',
			noAccount: "Don't have an account?",
			haveAccount: 'Already have an account?',
			errors: {
				emailInUse: 'This email is already registered.',
				invalidEmail: 'Invalid email format.',
				weakPassword: 'Password must be at least 6 characters.',
				wrongCredentials: 'Incorrect email or password.',
				generic: 'Something went wrong, please try again.'
			}
		},

		// Dashboard
		dashboard: {
			title: 'My Papers',
			newPaper: 'New Paper',
			searchPlaceholder: 'Search papers...',
			loadingPapers: 'Loading papers...',
			noPapers: 'No papers yet',
			noPapersHint: 'Click "New Paper" to get started.',
			draftProgress: 'Draft progress',
			deletePaper: 'Delete paper',
			deleteConfirm: (title) => `Delete "${title}"? This cannot be undone.`,
			deleteFailed: 'Failed to delete: '
		},

		// New Project page
		newProject: {
			breadcrumb: 'New Paper',
			title: 'Create New Paper',
			researchContextTitle: 'Research Context',
			researchContextDesc:
				"These fields anchor the AI's writing -- every fact and figure here will be reused consistently across the entire generated paper. All fields are required.",
			docType: 'Document type',
			citationStyle: 'Citation style',
			writingLanguage: 'Writing language',
			writingLanguageHint: 'This is the language your generated paper will be written in -- separate from the app\'s interface language.',
			detailsTitle: 'Details',
			detailsDesc: "Extra per-paragraph detail the AI can use where relevant. Leave any field blank to skip it -- nothing here is required.",
			sourcesTitle: 'Sources',
			sourcesDesc: 'You can also add sources later from the editor page.',
			sourceTitlePlaceholder: 'Source title',
			authorsPlaceholder: 'Authors',
			yearPlaceholder: 'Year',
			venuePlaceholder: 'Venue/Journal',
			linkPlaceholder: 'Source link (optional)',
			addSource: 'Add Source',
			creating: 'Creating...',
			createPaper: 'Create Paper',
			createFailed: 'Failed to create project: ',
			contextFields: {
				domain: 'Research domain',
				problem: 'Problem',
				existing_solution: 'Existing solution',
				limitation: 'Limitation of existing solution',
				proposed_solution: 'Proposed solution',
				method: 'Method(s) used',
				dataset: 'Dataset',
				evaluation_metric: 'Evaluation metric',
				baseline: 'Baseline',
				result: 'Result',
				contribution: 'Contribution'
			},
			detailGroups: {
				novelty: 'Novelty & Approach',
				problem: 'Problem & Motivation',
				results: 'Results Summary',
				application: 'Application & Context',
				design: 'Research Design',
				metrics: 'Metrics & Results Detail',
				statistics: 'Statistical Analysis',
				practical: 'Practical Application & Limitations',
				impact: 'Impact'
			}
		},

		// Workspace / Editor
		workspace: {
			breadcrumb: 'Editor',
			loadingProject: 'Loading...',
			generateFullPaper: 'Generate Full Paper (AI)',
			regeneratePaper: 'Regenerate Paper (AI)',
			generating: 'Generating...',
			generatingPaperTitle: 'Generating your paper with AI...',
			generatingPaperHint: 'Writing every section based on your research context. This usually takes a few seconds.',
			export: 'Export',
			paperStructure: 'Paper Structure',
			addSection: 'Add Section',
			addSectionPrompt: 'New section name:',
			expand: 'Expand',
			expanding: 'Expanding...',
			condense: 'Condense',
			condensing: 'Condensing...',
			editorPlaceholder: 'This section is empty. Write manually, or use Regenerate Paper (AI) above.',
			autosaveHint:
				"Changes are automatically saved to Firestore shortly after you stop typing. AI-generated content is based only on the research context you provided -- always verify figures before submitting.",
			loadingSections: 'Loading paper sections...',
			sourcesTitle: 'Sources',
			noSources: 'No sources yet. Add some from the "New Paper" page, or extend this feature to add them directly here.',
			viewFile: 'View file',
			openLink: 'Open link',
			exportTitle: 'Export Paper',
			exportDesc: 'Export functionality will be built once the section data structure is finalized.',
			overwriteConfirm: 'This will overwrite the current draft in every section. Continue?',
			errors: {
				noContext: 'This project has no research context. Create a new paper with research context filled in to use this feature.',
				generateFailed: 'Failed to generate the paper.',
				noExpandContent: 'This section has no content to expand yet.',
				expandFailed: 'Failed to expand text.',
				noCondenseContent: 'This section has no content to condense yet.',
				condenseFailed: 'Failed to condense text.'
			}
		},

		// Pricing
		pricing: {
			title: 'Pricing',
			breadcrumb: 'Pricing',
			heading: 'Choose your plan',
			subheading: 'Upgrade anytime. Payments are processed securely via Midtrans.',
			loadingPlans: 'Loading plans...',
			currentPlan: 'Current Plan',
			free: 'Free',
			perMonth: '/month',
			perYear: '/year',
			active: 'Active',
			defaultPlan: 'Default plan',
			subscribe: 'Subscribe',
			processing: 'Processing...',
			manageHint: 'Need to manage your current subscription? Go to',
			billingLink: 'Billing',
			banners: {
				success: 'Payment successful! Your plan will update shortly.',
				pending: 'Payment is pending. Complete it to activate your plan.',
				error: 'Payment failed. Please try again.'
			}
		},

		// Billing
		billing: {
			title: 'Billing',
			breadcrumb: 'Billing',
			currentSubscription: 'Current Subscription',
			freePlanNotice: "You're currently on the Free plan. Upgrade to unlock more papers and features.",
			viewPlans: 'View Plans',
			plan: 'Plan',
			renewsOn: 'Renews / expires on',
			lastOrderId: 'Last order ID',
			changePlan: 'Change Plan',
			cancelHint: 'To cancel your subscription, contact support. Cancellation handling will be added once the billing backend is finalized.'
		},

		subscriptionBadge: {
			freePlan: 'Free plan',
			proFallback: 'Pro'
		},

		// Language switcher itself
		languageSwitcher: {
			label: 'Language',
			en: 'English',
			id: 'Indonesian'
		}
	},

	id: {
		common: {
			back: 'Kembali',
			cancel: 'Batal',
			close: 'Tutup',
			save: 'Simpan',
			delete: 'Hapus',
			edit: 'Edit',
			loading: 'Memuat...',
			saving: 'Menyimpan...',
			saved: 'Tersimpan',
			optional: 'opsional',
			logOut: 'Keluar',
			dashboard: 'Dashboard'
		},

		login: {
			signIn: 'Masuk',
			createAccount: 'Buat Akun',
			tagline: 'AI Paper Generator',
			email: 'Email',
			password: 'Password',
			emailPlaceholder: 'nama@email.com',
			passwordPlaceholder: 'Minimal 6 karakter',
			processing: 'Memproses...',
			signUp: 'Daftar',
			noAccount: 'Belum punya akun?',
			haveAccount: 'Sudah punya akun?',
			errors: {
				emailInUse: 'Email sudah terdaftar.',
				invalidEmail: 'Format email tidak valid.',
				weakPassword: 'Password minimal 6 karakter.',
				wrongCredentials: 'Email atau password salah.',
				generic: 'Terjadi kesalahan, coba lagi.'
			}
		},

		dashboard: {
			title: 'Paper Saya',
			newPaper: 'Paper Baru',
			searchPlaceholder: 'Cari paper...',
			loadingPapers: 'Memuat paper...',
			noPapers: 'Belum ada paper',
			noPapersHint: 'Klik "Paper Baru" untuk mulai.',
			draftProgress: 'Progres draf',
			deletePaper: 'Hapus paper',
			deleteConfirm: (title) => `Hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`,
			deleteFailed: 'Gagal menghapus: '
		},

		newProject: {
			breadcrumb: 'Paper Baru',
			title: 'Buat Paper Baru',
			researchContextTitle: 'Konteks Penelitian',
			researchContextDesc:
				'Field-field ini jadi acuan penulisan AI -- setiap fakta dan angka di sini akan dipakai konsisten di seluruh paper yang dihasilkan. Semua field wajib diisi.',
			docType: 'Jenis dokumen',
			citationStyle: 'Gaya sitasi',
			writingLanguage: 'Bahasa penulisan',
			writingLanguageHint: 'Ini adalah bahasa yang dipakai untuk paper yang dihasilkan -- terpisah dari bahasa antarmuka aplikasi.',
			detailsTitle: 'Detail',
			detailsDesc: 'Detail tambahan per-paragraf yang bisa dipakai AI kalau relevan. Boleh dikosongkan -- tidak ada yang wajib di sini.',
			sourcesTitle: 'Sumber',
			sourcesDesc: 'Kamu juga bisa menambah sumber nanti dari halaman editor.',
			sourceTitlePlaceholder: 'Judul sumber',
			authorsPlaceholder: 'Penulis',
			yearPlaceholder: 'Tahun',
			venuePlaceholder: 'Venue/Jurnal',
			linkPlaceholder: 'Link sumber (opsional)',
			addSource: 'Tambah Sumber',
			creating: 'Membuat...',
			createPaper: 'Buat Paper',
			createFailed: 'Gagal membuat project: ',
			contextFields: {
				domain: 'Domain penelitian',
				problem: 'Masalah',
				existing_solution: 'Solusi yang sudah ada',
				limitation: 'Keterbatasan solusi yang sudah ada',
				proposed_solution: 'Solusi yang diusulkan',
				method: 'Metode yang digunakan',
				dataset: 'Dataset',
				evaluation_metric: 'Metrik evaluasi',
				baseline: 'Baseline',
				result: 'Hasil',
				contribution: 'Kontribusi'
			},
			detailGroups: {
				novelty: 'Novelty & Pendekatan',
				problem: 'Masalah & Motivasi',
				results: 'Ringkasan Hasil',
				application: 'Aplikasi & Konteks',
				design: 'Desain Penelitian',
				metrics: 'Detail Metrik & Hasil',
				statistics: 'Analisis Statistik',
				practical: 'Aplikasi Praktis & Keterbatasan',
				impact: 'Dampak'
			}
		},

		workspace: {
			breadcrumb: 'Editor',
			loadingProject: 'Memuat...',
			generateFullPaper: 'Buat Paper Lengkap (AI)',
			regeneratePaper: 'Buat Ulang Paper (AI)',
			generating: 'Memproses...',
			generatingPaperTitle: 'Sedang membuat paper dengan AI...',
			generatingPaperHint: 'Menulis setiap bagian berdasarkan konteks penelitianmu. Biasanya hanya perlu beberapa detik.',
			export: 'Ekspor',
			paperStructure: 'Struktur Paper',
			addSection: 'Tambah Bagian',
			addSectionPrompt: 'Nama bagian baru:',
			expand: 'Perluas',
			expanding: 'Memperluas...',
			condense: 'Ringkas',
			condensing: 'Meringkas...',
			editorPlaceholder: 'Bagian ini masih kosong. Tulis manual, atau pakai Buat Ulang Paper (AI) di atas.',
			autosaveHint:
				'Perubahan tersimpan otomatis ke Firestore beberapa saat setelah kamu berhenti mengetik. Konten hasil AI hanya berdasarkan konteks penelitian yang kamu berikan -- selalu verifikasi angka sebelum submit.',
			loadingSections: 'Memuat bagian paper...',
			sourcesTitle: 'Sumber',
			noSources: 'Belum ada sumber. Tambahkan dari halaman "Paper Baru", atau perluas fitur ini untuk menambah langsung di sini.',
			viewFile: 'Lihat file',
			openLink: 'Buka link',
			exportTitle: 'Ekspor Paper',
			exportDesc: 'Fitur ekspor akan dibangun setelah struktur data section final.',
			overwriteConfirm: 'Ini akan menimpa draf yang ada di semua bagian. Lanjutkan?',
			errors: {
				noContext: 'Project ini belum punya konteks penelitian. Buat paper baru dengan konteks penelitian terisi untuk pakai fitur ini.',
				generateFailed: 'Gagal membuat paper.',
				noExpandContent: 'Bagian ini belum ada isinya untuk diperluas.',
				expandFailed: 'Gagal memperluas teks.',
				noCondenseContent: 'Bagian ini belum ada isinya untuk diringkas.',
				condenseFailed: 'Gagal meringkas teks.'
			}
		},

		pricing: {
			title: 'Harga',
			breadcrumb: 'Harga',
			heading: 'Pilih paketmu',
			subheading: 'Upgrade kapan saja. Pembayaran diproses aman lewat Midtrans.',
			loadingPlans: 'Memuat paket...',
			currentPlan: 'Paket Aktif',
			free: 'Gratis',
			perMonth: '/bulan',
			perYear: '/tahun',
			active: 'Aktif',
			defaultPlan: 'Paket default',
			subscribe: 'Berlangganan',
			processing: 'Memproses...',
			manageHint: 'Mau kelola langganan aktifmu? Buka',
			billingLink: 'Billing',
			banners: {
				success: 'Pembayaran berhasil! Paketmu akan diperbarui sebentar lagi.',
				pending: 'Pembayaran masih tertunda. Selesaikan untuk mengaktifkan paketmu.',
				error: 'Pembayaran gagal. Silakan coba lagi.'
			}
		},

		billing: {
			title: 'Billing',
			breadcrumb: 'Billing',
			currentSubscription: 'Langganan Aktif',
			freePlanNotice: 'Kamu saat ini di paket Gratis. Upgrade untuk membuka lebih banyak paper dan fitur.',
			viewPlans: 'Lihat Paket',
			plan: 'Paket',
			renewsOn: 'Diperpanjang / berakhir pada',
			lastOrderId: 'ID Order Terakhir',
			changePlan: 'Ganti Paket',
			cancelHint: 'Untuk membatalkan langganan, hubungi support. Fitur pembatalan akan ditambahkan setelah backend billing final.'
		},

		subscriptionBadge: {
			freePlan: 'Paket Gratis',
			proFallback: 'Pro'
		},

		languageSwitcher: {
			label: 'Bahasa',
			en: 'Inggris',
			id: 'Indonesia'
		}
	}
};
