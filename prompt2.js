const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 160 },
  children: [new TextRun({ text, bold: true, size: 36, color: "0F172A", font: "Calibri" })]
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 120 },
  children: [new TextRun({ text, bold: true, size: 28, color: "1E40AF", font: "Calibri" })]
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 80 },
  children: [new TextRun({ text, bold: true, size: 24, color: "1E3A5F", font: "Calibri" })]
});

const P = (text, opts = {}) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, font: "Calibri", size: 22, ...opts })]
});

const WARN = (text) => new Paragraph({
  spacing: { before: 100, after: 100 },
  children: [new TextRun({ text: "⚠ " + text, bold: true, color: "DC2626", font: "Calibri", size: 22 })]
});

const NOTE = (text) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text: "✅ " + text, bold: true, color: "059669", font: "Calibri", size: 22 })]
});

const HR = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "3B82F6", space: 1 } },
  spacing: { before: 200, after: 200 },
  children: []
});

const BREAK = () => new Paragraph({
  children: [new TextRun({ break: 1 })]
});

const b = (text, bold = false) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text, bold, font: "Calibri", size: 22 })]
});

const n = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  spacing: { before: 60, after: 60 },
  children: [new TextRun({ text, font: "Calibri", size: 22 })]
});

const border = { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" };
const borders = { top: border, bottom: border, left: border, right: border };
const hdrBorder = { style: BorderStyle.SINGLE, size: 1, color: "1E3A5F" };
const hdrBorders = { top: hdrBorder, bottom: hdrBorder, left: hdrBorder, right: hdrBorder };

const TH = (cells, widths) => new TableRow({
  tableHeader: true,
  children: cells.map((c, i) => new TableCell({
    shading: { fill: "1E3A5F", type: ShadingType.CLEAR },
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: hdrBorders,
    children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })] })]
  }))
});

const TR = (cells, widths, shade = false) => new TableRow({
  children: cells.map((c, i) => new TableCell({
    shading: { fill: shade ? "F8FAFC" : "FFFFFF", type: ShadingType.CLEAR },
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders,
    children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, font: "Calibri" })] })]
  }))
});

const T = (headers, rows, widths) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: widths,
  rows: [TH(headers, widths), ...rows.map((r, i) => TR(r, widths, i % 2 === 0))]
});

const CODE = (lines) => lines.map(line => new Paragraph({
  shading: { fill: "0F172A", type: ShadingType.CLEAR },
  spacing: { before: 0, after: 0 },
  indent: { left: 360 },
  children: [new TextRun({ text: line || " ", font: "Courier New", size: 18, color: "94A3B8" })]
}));

// ─── DOCUMENT ─────────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      },
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Calibri", color: "0F172A" },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri", color: "1E40AF" },
        paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: "1E3A5F" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [

      // ═══════════════════════════════════════════════════════════
      // TITLE PAGE
      // ═══════════════════════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 200 },
        children: [new TextRun({ text: "SERVICE MARKETPLACE PLATFORM", bold: true, size: 56, color: "0F172A", font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "Master AI Development Prompt — v3.0", size: 30, color: "3B82F6", font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Laravel 13  •  React  •  Inertia.js  •  Ant Design  •  MySQL", size: 22, color: "64748B", font: "Calibri", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 600 },
        children: [new TextRun({ text: "Admin Panel  •  Client Portal  •  Worker Portal", size: 22, color: "64748B", font: "Calibri" })]
      }),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // HOW TO USE THIS PROMPT
      // ═══════════════════════════════════════════════════════════
      H1("HOW TO USE THIS PROMPT"),
      P("This document is a complete system specification for a vibe-coding AI agent. Paste the entire prompt into any AI (Claude, Cursor, Windsurf, ChatGPT) before starting any work."),
      BREAK(),
      P("The phases are strictly sequential. Never skip a phase. If you stop mid-session, note which phase and step number you were on. Resume by telling the AI: 'We are on Phase X, Step Y. Continue from there.'", { bold: true }),
      BREAK(),
      WARN("Read ALL sections before writing a single line of code. Do not start coding until you have confirmed understanding of all 14 sections."),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 1 — ROLE
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 1 — YOUR ROLE & RULES"),
      P("You are a Senior Software Architect, Senior Laravel Engineer, Senior React Engineer, Database Architect, and SaaS UI/UX Designer combined."),
      P("You are building a production-grade, commercial-quality service marketplace platform from scratch. Think at the level of a CTO of a funded startup."),
      BREAK(),
      P("ABSOLUTE RULES — NEVER VIOLATE:", { bold: true, color: "DC2626" }),
      b("Read ALL 14 sections before writing any code."),
      b("Never simplify requirements. Never use shortcuts or placeholder code."),
      b("Every function, controller, component, and hook must be complete and working."),
      b("Do NOT write TODO comments. Incomplete code is rejected."),
      b("Follow the exact execution order in Section 13."),
      b("Each phase ends with a CHECKPOINT. Do not start the next phase before the checkpoint passes."),
      b("When resuming a session, the AI must ask: 'Which phase and step are we on?' before doing anything."),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 2 — TECH STACK
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 2 — MANDATORY TECH STACK"),
      H2("2.1 Backend"),
      T(
        ["Layer", "Technology", "Notes"],
        [
          ["PHP", "8.4", "Latest stable"],
          ["Framework", "Laravel 13", "Mandatory — no downgrade"],
          ["Database", "MySQL 8.x", "InnoDB, utf8mb4_unicode_ci"],
          ["ORM", "Eloquent", "With Repository pattern where needed"],
          ["Auth", "Laravel Breeze (Inertia stack)", "Modified for 3-role system"],
          ["Authorization", "Laravel Policies", "One Policy per model, no inline auth checks"],
          ["Validation", "Form Request classes", "100% of inputs — zero inline validation"],
          ["Business Logic", "Service Layer (app/Services/)", "Controllers are thin HTTP handlers only"],
          ["Enums", "PHP 8.1 backed enums", "For status, role, type fields"],
          ["Events/Listeners", "Laravel Events", "Order lifecycle events"],
          ["Notifications", "Laravel Notifications", "In-app + email channels"],
          ["File Storage", "Laravel Storage", "Local or S3 compatible"],
          ["Payments", "Stripe (cashier or raw SDK)", "Credit top-up only"],
        ],
        [2000, 2600, 4760]
      ),
      BREAK(),
      H2("2.2 Frontend"),
      T(
        ["Layer", "Technology", "Notes"],
        [
          ["Framework", "React 18", "Functional components + hooks only. No class components."],
          ["Bridge", "Inertia.js v2", "SPA experience without a separate REST API"],
          ["UI Library", "Ant Design 5.x", "PRIMARY — ALL components must come from AntD"],
          ["Styling", "TailwindCSS v3", "ONLY for layout adjustments and custom color overrides"],
          ["Charts", "Apache ECharts (echarts-for-react)", "Dashboards and analytics only"],
          ["Icons", "Ant Design Icons", "Consistent icon system across all panels"],
          ["State", "React useState + useContext", "No Redux or Zustand needed"],
          ["Forms", "Inertia useForm + AntD Form", "Frontend + backend validation synchronized"],
        ],
        [1800, 2600, 4960]
      ),
      BREAK(),
      H2("2.3 Design Philosophy"),
      P("The application must feel like a premium B2B SaaS product. Reference designs:"),
      b("Stripe Dashboard — clean data-heavy layouts, professional typography"),
      b("Linear — tight spacing, sharp UI, no fluff"),
      b("Vercel Dashboard — minimal, fast, information-dense"),
      b("Clerk — consistent form patterns, clear validation"),
      BREAK(),
      P("STRICTLY FORBIDDEN:", { bold: true, color: "DC2626" }),
      b("Heavy gradients, rainbow backgrounds, drop shadows on everything"),
      b("Childish colors, cartoonish icons, flashy animations"),
      b("Inconsistent spacing or layout between pages"),
      b("Inline styles inside React components"),
      b("Bootstrap, jQuery, or vanilla JS DOM manipulation"),
      b("Any SEO-related fields (no meta titles, meta descriptions)"),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 3 — PROJECT OVERVIEW
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 3 — PROJECT OVERVIEW"),
      P("This is a digital service marketplace. Clients purchase services using wallet credits. Workers fulfill orders. Admins manage everything."),
      BREAK(),
      P("Real-world analogy: Think of it like Fiverr/Upwork but with one critical difference — workers do NOT browse or accept jobs. Admin assigns every job manually to a specific worker."),
      BREAK(),
      P("Three portals, each completely separate:", { bold: true }),
      T(
        ["Portal", "Who Uses It", "Core Purpose"],
        [
          ["Admin Portal", "Platform owner/manager", "Manage categories, services, dynamic fields, workers, orders (including worker assignment), reports, settings, credits"],
          ["Client Portal", "Customer who buys services", "Browse services, configure orders, pay with credits, upload assets, request revisions, complete orders, manage wallet"],
          ["Worker Portal", "Service provider", "View assigned orders only, submit deliverables, communicate with client via comments, manage profile"],
        ],
        [1800, 2200, 5360]
      ),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 4 — ARCHITECTURE & FOLDER STRUCTURE
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 4 — ARCHITECTURE & FOLDER STRUCTURE"),
      H2("4.1 Backend Structure"),
      ...CODE([
        "app/",
        "  Enums/",
        "    UserRole.php           (admin, client, worker)",
        "    OrderStatus.php        (pending, assigned, in_progress, submitted, revision_requested, completed, cancelled)",
        "    TransactionType.php    (credit_purchase, credit_spend)",
        "    AssetType.php          (reference, deliverable, comment)",
        "    RevisionStatus.php     (requested, in_progress, resolved)",
        "    FieldType.php          (text, textarea, number, decimal, email, phone, date, dropdown...)",
        "  Http/",
        "    Controllers/",
        "      Admin/               (CategoryController, ServiceController, CategoryFieldController,",
        "                            WorkerController, CustomerController, OrderController,",
        "                            CreditPackageController, TransactionController,",
        "                            EscalationController, ReportController, SettingsController)",
        "      Client/              (DashboardController, ServiceController, CartController,",
        "                            OrderController, WalletController, TransactionController)",
        "      Worker/              (DashboardController, OrderController, ProfileController)",
        "      NotificationController.php  (shared, handles mark-read, delete)",
        "      ProfileController.php       (shared, handles all roles)",
        "    Requests/",
        "      Admin/               (StoreCategoryRequest, StoreCategoryFieldRequest,",
        "                            StoreServiceRequest, StoreWorkerRequest,",
        "                            StoreOrderAssignRequest, UpdateSettingsRequest, ...)",
        "      Client/              (StoreOrderRequest, StoreRevisionRequest, StoreReviewRequest,",
        "                            StoreCommentRequest, TopupRequest, ...)",
        "      Worker/              (SubmitDeliveryRequest, UpdateProfileRequest, ...)",
        "    Middleware/",
        "      EnsureRole.php",
        "  Models/",
        "    User.php, Category.php, CategoryField.php, Service.php,",
        "    ServiceFieldValue.php, ServiceStep.php, ServiceStepOption.php,",
        "    Order.php, OrderAsset.php, OrderSelection.php,",
        "    Revision.php, Review.php, Escalation.php, OrderComment.php,",
        "    Wallet.php, Transaction.php, CreditPackage.php,",
        "    WorkerProfile.php, Skill.php, Setting.php",
        "  Services/",
        "    OrderService.php          (place, assign, complete, revise, cancel)",
        "    WalletService.php         (spend, topup, balance)",
        "    CategoryFieldService.php  (field CRUD, reorder, schema for renderer)",
        "    NotificationService.php",
        "    ReportService.php",
        "  Policies/",
        "    OrderPolicy.php, CategoryPolicy.php, ServicePolicy.php, etc.",
        "  Events/  +  Listeners/",
        "    OrderAssigned, OrderSubmitted, OrderCompleted,",
        "    RevisionRequested, EscalationResolved, CommentPosted",
        "  Notifications/",
        "    OrderAssignedNotification, OrderSubmittedNotification,",
        "    OrderCompletedNotification, RevisionRequestedNotification,",
        "    CommentPostedNotification, EscalationResolvedNotification",
        "routes/",
        "  web.php         (auth routes + portal redirects)",
        "  admin.php",
        "  client.php",
        "  worker.php",
      ]),
      BREAK(),
      H2("4.2 Frontend Structure"),
      ...CODE([
        "resources/js/",
        "  Layouts/",
        "    AuthLayout.jsx",
        "    AdminLayout.jsx         (dark sidebar, header with notifications + profile)",
        "    ClientLayout.jsx        (light sidebar, cart icon in header)",
        "    WorkerLayout.jsx        (minimal sidebar)",
        "  Pages/",
        "    Auth/                   (Login, Register, ForgotPassword, ResetPassword)",
        "    Admin/",
        "      Dashboard/            Index.jsx",
        "      Categories/           Index.jsx, Fields.jsx (CategoryFieldBuilder)",
        "      Services/             Index.jsx, Form.jsx, Steps.jsx",
        "      Workers/              Index.jsx, Form.jsx, Show.jsx",
        "      Customers/            Index.jsx, Show.jsx",
        "      Orders/               Index.jsx, Show.jsx",
        "      CreditPackages/       Index.jsx",
        "      Transactions/         Index.jsx",
        "      Escalations/          Index.jsx, Show.jsx",
        "      Reports/              Revenue.jsx",
        "      Settings/             Index.jsx",
        "    Client/",
        "      Dashboard/            Index.jsx",
        "      Services/             Index.jsx, Show.jsx",
        "      Cart/                 Index.jsx, Checkout.jsx",
        "      Orders/               Index.jsx, Show.jsx",
        "      Wallet/               Index.jsx, Topup.jsx",
        "      Transactions/         Index.jsx",
        "    Worker/",
        "      Dashboard/            Index.jsx",
        "      Orders/               Index.jsx, Show.jsx",
        "      Profile/              Index.jsx",
        "  Components/",
        "    Common/",
        "      DataTable.jsx         (reusable AntD Table with search/filter/sort/paginate/export)",
        "      PageHeader.jsx        (title + breadcrumbs + action buttons)",
        "      StatCard.jsx          (icon + label + number + optional trend arrow)",
        "      ChartCard.jsx         (title + ECharts wrapper + skeleton loader)",
        "      StatusBadge.jsx       (AntD Tag, color-mapped per status value)",
        "      ConfirmModal.jsx      (centralized — never use browser confirm())",
        "      EmptyState.jsx        (illustration + message + optional CTA)",
        "      FilterBar.jsx         (row of filter inputs above DataTable)",
        "      BentoGrid.jsx         (CSS grid wrapper utility component)",
        "    DynamicFields/",
        "      CategoryFieldBuilder.jsx   (admin defines fields per category)",
        "      DynamicFieldRenderer.jsx   (renders field schema into AntD form items)",
        "    Charts/",
        "      AreaChart.jsx, DonutChart.jsx, BarChart.jsx, HBarChart.jsx",
        "  Hooks/",
        "    useTable.js             (pagination, search, sort state)",
        "    useFilters.js           (filter state + URL sync)",
        "    useDynamicFields.js     (fetch + cache category fields by category_id)",
        "  Utils/",
        "    formatters.js           (currency, date, file size)",
        "    constants.js            (STATUS_COLORS, FIELD_TYPES, etc.)",
      ]),
      H2("4.3 Route Groups"),
      ...CODE([
        "// web.php",
        "Route::middleware('guest')->group(fn() => require base_path('routes/auth.php'));",
        "",
        "Route::middleware(['auth', 'role:admin'])",
        "  ->prefix('admin')->name('admin.')",
        "  ->group(base_path('routes/admin.php'));",
        "",
        "Route::middleware(['auth', 'role:client'])",
        "  ->prefix('client')->name('client.')",
        "  ->group(base_path('routes/client.php'));",
        "",
        "Route::middleware(['auth', 'role:worker'])",
        "  ->prefix('worker')->name('worker.')",
        "  ->group(base_path('routes/worker.php'));",
        "",
        "// Shared (all authenticated roles)",
        "Route::middleware('auth')->group(function () {",
        "  Route::resource('profile', ProfileController::class);",
        "  Route::post('notifications/{id}/read', ...);",
        "  Route::post('notifications/read-all', ...);",
        "  Route::delete('notifications/{id}', ...);",
        "});",
      ]),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 5 — DATABASE SCHEMA
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 5 — COMPLETE DATABASE SCHEMA"),
      H2("5.1 users"),
      T(
        ["Column", "Type", "Notes"],
        [
          ["id", "bigint PK", ""],
          ["name", "varchar(255)", ""],
          ["email", "varchar(255) UNIQUE", ""],
          ["password", "varchar(255)", "bcrypt hashed"],
          ["role", "enum('admin','client','worker')", ""],
          ["phone", "varchar(20) null", ""],
          ["status", "enum('active','inactive') default active", ""],
          ["profile_photo", "varchar(255) null", ""],
          ["email_verified_at", "timestamp null", ""],
          ["remember_token", "varchar(100) null", ""],
          ["timestamps", "created_at, updated_at", ""],
        ],
        [2400, 3200, 3760]
      ),
      BREAK(),
      H2("5.2 categories"),
      T(
        ["Column", "Type", "Notes"],
        [
          ["id", "bigint PK", ""],
          ["name", "varchar(255) UNIQUE", ""],
          ["slug", "varchar(255) UNIQUE", "Auto-generated from name"],
          ["description", "text null", ""],
          ["icon", "varchar(255) null", "AntD icon name string"],
          ["image", "varchar(255) null", "File path"],
          ["is_active", "boolean default true", ""],
          ["sort_order", "int default 0", ""],
          ["timestamps", "", ""],
        ],
        [2400, 3000, 3960]
      ),
      BREAK(),
      H2("5.3 category_fields  (DYNAMIC FIELDS ENGINE)"),
      P("This is the core of the dynamic form system. Admin defines fields per category. When a service is created under that category, these fields render automatically.", { bold: false }),
      T(
        ["Column", "Type", "Notes"],
        [
          ["id", "bigint PK", ""],
          ["category_id", "FK -> categories.id CASCADE", ""],
          ["label", "varchar(255)", "Display label shown to user"],
          ["field_key", "varchar(100)", "snake_case, unique per category_id"],
          ["field_type", "enum (see Section 7)", "text, number, dropdown, radio_group, etc."],
          ["placeholder", "varchar(255) null", ""],
          ["help_text", "text null", "Shown below the input"],
          ["default_value", "text null", ""],
          ["options", "json null", "[{label, value}] for dropdown/radio/checkbox"],
          ["is_required", "boolean default false", ""],
          ["is_visible", "boolean default true", ""],
          ["min_value", "varchar(50) null", "number/decimal validation"],
          ["max_value", "varchar(50) null", "number/decimal validation"],
          ["min_length", "int null", "text/textarea validation"],
          ["max_length", "int null", "text/textarea validation"],
          ["allowed_extensions", "varchar(255) null", "file_upload fields"],
          ["max_file_size_mb", "int null", "file/image upload fields"],
          ["sort_order", "int default 0", ""],
          ["timestamps", "", ""],
        ],
        [2400, 2800, 4160]
      ),
      BREAK(),
      H2("5.4 services"),
      T(
        ["Column", "Type", "Notes"],
        [
          ["id", "bigint PK", ""],
          ["category_id", "FK -> categories.id", ""],
          ["name", "varchar(255)", ""],
          ["slug", "varchar(255) UNIQUE", "Auto-generated"],
          ["short_description", "varchar(500) null", ""],
          ["description", "text null", ""],
          ["image", "varchar(255) null", ""],
          ["credit_cost", "int unsigned", "Base cost in credits"],
          ["delivery_days", "int unsigned", ""],
          ["revisions", "int unsigned default 1", "Free revisions allowed"],
          ["extra_revision_cost", "int unsigned default 0", "Credits per extra revision beyond limit"],
          ["is_active", "boolean default true", ""],
          ["is_featured", "boolean default false", ""],
          ["is_deliverable", "boolean default true", ""],
          ["timestamps", "", ""],
        ],
        [2400, 2600, 4360]
      ),
      BREAK(),
      H2("5.5 service_field_values"),
      P("Stores the values admin fills in when creating/editing a service (the dynamic category fields)."),
      T(
        ["Column", "Type", "Notes"],
        [
          ["id", "bigint PK", ""],
          ["service_id", "FK -> services.id CASCADE", ""],
          ["category_field_id", "FK -> category_fields.id CASCADE", ""],
          ["value", "text null", "Cast at read time based on field_type"],
          ["timestamps", "", ""],
        ],
        [2400, 2800, 4160]
      ),
      BREAK(),
      H2("5.6 service_steps  +  service_step_options"),
      P("The order configuration wizard. Each step is a question (single or multi select). Options have add-on credit costs."),
      T(
        ["Column", "Type", "Notes"],
        [
          ["service_steps: id", "bigint PK", ""],
          ["service_steps: service_id", "FK -> services.id", ""],
          ["service_steps: name", "varchar(255)", ""],
          ["service_steps: description", "text null", ""],
          ["service_steps: input_type", "enum('single_select','multi_select')", ""],
          ["service_steps: is_required", "boolean default true", ""],
          ["service_steps: sort_order", "int default 0", ""],
          ["service_step_options: id", "bigint PK", ""],
          ["service_step_options: service_step_id", "FK -> service_steps.id", ""],
          ["service_step_options: label", "varchar(255)", ""],
          ["service_step_options: description", "text null", ""],
          ["service_step_options: credit_cost", "int unsigned default 0", "Added to base credit_cost"],
          ["service_step_options: is_default", "boolean default false", ""],
          ["service_step_options: sort_order", "int default 0", ""],
        ],
        [2800, 2200, 4360]
      ),
      BREAK(),
      H2("5.7 orders"),
      T(
        ["Column", "Type", "Notes"],
        [
          ["id", "bigint PK", ""],
          ["client_id", "FK -> users.id", ""],
          ["worker_id", "FK -> users.id null", "Set by admin assignment only"],
          ["service_id", "FK -> services.id", ""],
          ["status", "enum (see Section 6)", ""],
          ["credits_used", "int unsigned", "Total cost at time of placement"],
          ["notes", "text null", "Client notes at checkout"],
          ["cancellation_reason", "text null", "Admin-filled on cancel"],
          ["timestamps", "", ""],
        ],
        [2400, 2800, 4160]
      ),
      BREAK(),
      H2("5.8 Other Core Tables (summary)"),
      b("order_assets — order_id, type (reference/deliverable/comment), file_path, original_name, mime_type"),
      b("order_selections — order_id, step_id, option_id, step_name (snapshot), option_label (snapshot), credit_cost (snapshot)"),
      b("revisions — order_id, message, status (requested/in_progress/resolved), timestamps"),
      b("reviews — order_id, client_id, rating (1-5), review_text null, timestamps (one per order)"),
      b("escalations — order_id, client_id, message, status (open/resolved), resolution_notes null, resolved_at null"),
      b("order_comments — order_id, user_id, content null, timestamps (attachments stored in order_assets type=comment)"),
      b("wallets — user_id (unique FK), balance (int, credits)"),
      b("transactions — user_id, type (credit_purchase/credit_spend), credits, amount (money, null for spend), reference null, timestamps"),
      b("credit_packages — name, price (decimal), credits (int), bonus_credits (int default 0), is_active"),
      b("worker_profiles — user_id (1-1 FK), bio text null, experience text null, status (active/inactive), notes text null"),
      b("skills — id, name varchar(255) UNIQUE"),
      b("user_skills pivot — user_id, skill_id"),
      b("service_worker pivot — service_id, user_id (worker eligibility)"),
      b("settings — key varchar(100) UNIQUE, value text null"),
      b("public_holidays — id, name, date, is_active, timestamps"),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 6 — ORDER WORKFLOW
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 6 — ORDER LIFECYCLE & WORKFLOW"),
      H2("6.1 Status Enum"),
      T(
        ["Status", "Set By", "Meaning"],
        [
          ["pending", "System (on order creation)", "New order, no worker assigned yet"],
          ["assigned", "Admin (manual assignment)", "Admin picked a worker — worker notified"],
          ["in_progress", "Worker (starts work)", "Worker is actively working on the order"],
          ["submitted", "Worker (submits deliverable)", "Worker uploaded files — client notified to review"],
          ["revision_requested", "Client", "Client wants changes — credits charged if free revisions exceeded"],
          ["completed", "Client (approves delivery)", "Order fully done — worker notified"],
          ["cancelled", "Admin (with reason)", "Order terminated — client credits refunded"],
        ],
        [2000, 2400, 4960]
      ),
      BREAK(),
      WARN("WORKER CANNOT SELF-ASSIGN ORDERS. THIS IS NON-NEGOTIABLE. Worker portal has NO browse/accept feature."),
      BREAK(),
      H2("6.2 Complete Order Workflow"),
      ...CODE([
        "1. Client creates order",
        "   -> Status: PENDING",
        "   -> Credits deducted atomically from wallet (DB transaction)",
        "   -> Admin notified",
        "",
        "2. Admin reviews order -> assigns a worker",
        "   -> Status: ASSIGNED",
        "   -> worker_id set on order",
        "   -> Worker notified (if notify_worker_on_new_order = true)",
        "   -> Client notified (if notify_client_on_order_accepted = true)",
        "",
        "3. Worker starts work",
        "   -> Status: IN_PROGRESS",
        "   -> No system action, worker simply begins",
        "",
        "4. Worker uploads deliverable files",
        "   -> Status: SUBMITTED",
        "   -> Assets stored as type = deliverable",
        "   -> Pending/in-progress revisions marked as resolved",
        "   -> Client notified",
        "",
        "5a. Client approves (completes order)",
        "   -> Status: COMPLETED",
        "   -> Review + rating required (1-5 stars)",
        "   -> Worker notified",
        "",
        "5b. Client requests revision",
        "   -> Check: if existing_revisions >= service.revisions AND extra_revision_cost > 0",
        "         -> Deduct extra_revision_cost from client wallet",
        "   -> Status: REVISION_REQUESTED -> IN_PROGRESS",
        "   -> Revision record created (status: requested)",
        "   -> Client can upload additional reference assets",
        "   -> Worker notified",
        "",
        "6. Admin cancels (any status except completed)",
        "   -> Status: CANCELLED",
        "   -> credits_used refunded to client wallet",
        "   -> cancellation_reason stored",
      ]),
      BREAK(),
      H2("6.3 Order Creation Flow (Cart -> Checkout -> Order)"),
      n("Client browses services, selects a service"),
      n("Client configures the service: chooses step options, adds notes"),
      n("Client adds to cart (with optional temporary file uploads per cart item)"),
      n("Client repeats for more services if needed"),
      n("Client goes to checkout — sees order summary + total credits"),
      n("System validates: wallet balance >= total cost"),
      n("For each cart item: deduct credits atomically, create order (status=pending), snapshot selections into order_selections, move temp cart assets to order_assets (type=reference)"),
      n("Cart is cleared"),
      n("Client redirected to orders list with success message"),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 7 — DYNAMIC FIELDS ENGINE
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 7 — DYNAMIC CATEGORY FIELDS ENGINE"),
      H2("7.1 What This Is"),
      P("This is NOT a standalone form-builder tool. It is the mechanism that makes service forms show different extra fields depending on which category the service belongs to."),
      BREAK(),
      P("Problem it solves: An 'AC Repair' service needs Brand, AC Type, Warranty fields. A 'Web Development' service needs Technology, Source Code Included. These differ per category. Admin defines them once; the system renders them automatically everywhere."),
      BREAK(),
      H2("7.2 How It Works — Exact Flow"),
      n("Admin creates a Category (e.g., 'AC Repair')"),
      n("Admin opens Category -> Manage Fields -> adds fields using CategoryFieldBuilder"),
      n("Each field has: Label, Field Type, Options (for dropdown/radio), Required toggle, etc."),
      n("Fields saved to category_fields table linked to category_id"),
      n("Admin creates a Service -> selects Category = 'AC Repair'"),
      n("Service form immediately loads and renders the AC Repair fields below standard fields"),
      n("Admin fills Brand (dropdown), AC Type (radio), Warranty Days (number input), etc."),
      n("Values saved to service_field_values on service save"),
      n("If admin selects a different category, the dynamic fields section reloads with that category's fields"),
      BREAK(),
      H2("7.3 Real Category + Field Examples"),
      T(
        ["Category", "Field Label", "Field Type", "Options (if applicable)"],
        [
          ["AC Repair", "Brand", "dropdown", "Samsung, LG, Haier, Daikin, Gree, Other"],
          ["AC Repair", "AC Type", "radio_group", "Split, Window, Portable, Cassette"],
          ["AC Repair", "Warranty Days", "number", ""],
          ["AC Repair", "Home Visit Required", "switch", ""],
          ["Web Development", "Technology Stack", "dropdown", "React, Laravel, Vue, WordPress, Node.js"],
          ["Web Development", "Revisions Included", "number", ""],
          ["Web Development", "Source Code Included", "switch", ""],
          ["Vehicle Service", "Vehicle Brand", "dropdown", "Toyota, Honda, Suzuki, Hyundai, Other"],
          ["Vehicle Service", "Engine CC", "number", ""],
          ["Vehicle Service", "Registration Number", "text", ""],
          ["Vehicle Service", "Service Type", "multi_select", "Oil Change, Brake Check, Tire Change, Filter"],
          ["Logo Design", "Style Preference", "radio_group", "Minimalist, Modern, Classic, Abstract"],
          ["Logo Design", "Color Preference", "text", ""],
          ["Logo Design", "File Formats Required", "multi_select", "PNG, SVG, AI, PDF"],
          ["Property", "Area (sq ft)", "decimal", ""],
          ["Property", "Location/Area", "text", ""],
          ["Property", "Bedrooms", "number", ""],
          ["Property", "Furnished Status", "radio_group", "Furnished, Semi-Furnished, Unfurnished"],
        ],
        [2200, 2000, 1600, 3560]
      ),
      BREAK(),
      H2("7.4 Supported Field Types"),
      T(
        ["field_type", "AntD Component", "Use When"],
        [
          ["text", "Input", "Short free text — brand name, model, location, color"],
          ["textarea", "Input.TextArea", "Longer text — special instructions, additional notes"],
          ["number", "InputNumber (integer only)", "Whole numbers — bedrooms, warranty days, quantity, year"],
          ["decimal", "InputNumber (step 0.01)", "Decimal values — area, price, weight, size"],
          ["email", "Input (type=email)", "Email address fields"],
          ["phone", "Input (type=tel)", "Phone/mobile number fields"],
          ["date", "DatePicker", "Registration date, expiry date, DOB"],
          ["dropdown", "Select (single)", "Pick one from a list — brand, country, type, plan"],
          ["multi_select", "Select (mode=multiple)", "Pick several — file formats, amenities, services"],
          ["radio_group", "Radio.Group", "Few exclusive visual choices — AC type, gender, plan tier"],
          ["checkbox_group", "Checkbox.Group", "Multiple checkboxes — included features, amenities"],
          ["switch", "Switch", "Yes/No boolean — home visit, source code included, urgent"],
          ["image_upload", "Upload (accept=image/*)", "Upload an image related to the service/order"],
          ["file_upload", "Upload (any file)", "Upload documents, PDFs, zip files"],
          ["url", "Input (type=url)", "Website links, portfolio links"],
          ["tags", "Select (mode=tags)", "Free-form keywords/labels"],
        ],
        [1800, 2600, 4960]
      ),
      BREAK(),
      H2("7.5 Smart Field Type Auto-Suggestion"),
      P("When admin types a field label in CategoryFieldBuilder, the system should auto-suggest the best field_type. Admin can override."),
      T(
        ["If label contains...", "Suggest"],
        [
          ["brand, make, manufacturer, company", "dropdown"],
          ["type, category, class, tier, plan, option", "radio_group"],
          ["description, notes, instructions, details, comments", "textarea"],
          ["qty, quantity, count, number, year, age, bedrooms, floors, revisions, days", "number"],
          ["price, cost, fee, rate, area, size, weight", "decimal"],
          ["email", "email"],
          ["phone, mobile, contact, whatsapp", "phone"],
          ["date, dob, expiry, registered, issued, deadline", "date"],
          ["country, city, state, region, language", "dropdown"],
          ["features, services, formats, amenities, tags", "multi_select"],
          ["active, enabled, included, required, featured, urgent, covered", "switch"],
          ["image, photo, picture, logo, thumbnail, banner", "image_upload"],
          ["document, file, certificate, attachment, pdf", "file_upload"],
          ["website, url, link, portfolio", "url"],
          ["name, title, model, code, serial, reference", "text"],
        ],
        [3600, 5760]
      ),
      BREAK(),
      H2("7.6 CategoryFieldBuilder UI (Admin)"),
      P("Accessed from: Admin Sidebar -> Categories -> [row action] -> Manage Fields"),
      n("Page header: '[Category Name] — Manage Custom Fields'"),
      n("Existing fields listed with sort_order, drag handle to reorder"),
      n("'Add Field' button opens AntD Drawer with: Label, Field Type (auto-suggested + editable), Placeholder, Help Text, Required toggle, Visible toggle"),
      n("For dropdown/radio_group/checkbox_group/multi_select: dynamic Options section to add/remove {label, value} pairs"),
      n("For number/decimal: Min Value, Max Value fields"),
      n("For text/textarea: Min Length, Max Length fields"),
      n("For file_upload/image_upload: Allowed Extensions, Max File Size fields"),
      n("Edit and Delete buttons on each existing field row"),
      n("Reorder via drag-and-drop — sort_order updated via PATCH endpoint"),
      n("All saves via AJAX — no full page reload"),
      n("Optional: live preview panel rendering DynamicFieldRenderer with current schema"),
      BREAK(),
      H2("7.7 DynamicFieldRenderer Component"),
      P("Used in: Service Create/Edit form, Order Create form (client configuring service)"),
      ...CODE([
        "// DynamicFieldRenderer.jsx",
        "// Props: fields (array of category_field records), prefix (string, optional namespace)",
        "",
        "const DynamicFieldRenderer = ({ fields, prefix = '' }) => {",
        "  return fields.map(field => {",
        "    const name = prefix ? [prefix, field.field_key] : field.field_key;",
        "    const rules = buildValidationRules(field);  // required, min, max, etc.",
        "",
        "    switch (field.field_type) {",
        "      case 'text':        return <Form.Item name={name} label={field.label} rules={rules} extra={field.help_text}><Input placeholder={field.placeholder} /></Form.Item>;",
        "      case 'textarea':    return <Form.Item ...><Input.TextArea rows={4} /></Form.Item>;",
        "      case 'number':      return <Form.Item ...><InputNumber precision={0} min={field.min_value} max={field.max_value} /></Form.Item>;",
        "      case 'decimal':     return <Form.Item ...><InputNumber precision={2} step={0.01} /></Form.Item>;",
        "      case 'dropdown':    return <Form.Item ...><Select options={field.options} /></Form.Item>;",
        "      case 'multi_select':return <Form.Item ...><Select mode='multiple' options={field.options} /></Form.Item>;",
        "      case 'radio_group': return <Form.Item ...><Radio.Group options={field.options} /></Form.Item>;",
        "      case 'switch':      return <Form.Item name={name} label={field.label} valuePropName='checked'><Switch /></Form.Item>;",
        "      case 'image_upload':return <Form.Item ...><Upload accept='image/*' listType='picture-card' /></Form.Item>;",
        "      case 'file_upload': return <Form.Item ...><Upload accept={field.allowed_extensions} /></Form.Item>;",
        "      // ... date, email, phone, url, tags",
        "    }",
        "  });",
        "};",
      ]),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 8 — ADMIN PANEL (COMPLETE)
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 8 — ADMIN PANEL (COMPLETE SPECIFICATION)"),

      H2("8.1 Admin Sidebar Navigation"),
      T(
        ["Menu Item", "Route", "Icon"],
        [
          ["Dashboard", "admin.dashboard", "DashboardOutlined"],
          ["Categories", "admin.categories.index", "AppstoreOutlined"],
          ["Services", "admin.services.index", "ToolOutlined"],
          ["Workers", "admin.workers.index", "TeamOutlined"],
          ["Customers", "admin.customers.index", "UserOutlined"],
          ["Orders", "admin.orders.index", "FileTextOutlined"],
          ["Credit Packages", "admin.credit-packages.index", "CreditCardOutlined"],
          ["Public Holidays", "admin.holidays.index", "CalendarOutlined"],
          ["Transactions", "admin.transactions.index", "TransactionOutlined"],
          ["Escalations", "admin.escalations.index", "WarningOutlined (red badge if open)"],
          ["Reports", "admin.reports.revenue", "BarChartOutlined"],
          ["Settings", "admin.settings.index", "SettingOutlined"],
        ],
        [2000, 3200, 4160]
      ),
      BREAK(),
      H2("8.2 Admin Layout"),
      b("Dark sidebar: background #0F172A, white text/icons, active item highlighted blue"),
      b("Collapsible: 240px expanded, 60px icon-only when collapsed"),
      b("Top header: breadcrumbs on left, notifications bell + profile dropdown on right"),
      b("Content area: #F8FAFC background, 24px consistent padding on all sides"),
      b("Profile dropdown: shows name, email, role badge, 'My Profile' link, 'Logout' button"),
      b("Notification bell: shows unread count badge, dropdown with latest notifications, 'Mark all read' link"),
      BREAK(),
      H2("8.3 Admin Dashboard"),
      P("Bento Grid layout. Must feel like a premium analytics dashboard — not a generic admin panel."),
      b("Row 1 (StatCards): Total Revenue (credits), Total Orders, Active Clients, Active Workers, Pending Orders (orange if >0), Open Escalations (red badge if >0)"),
      b("Row 2 (Charts): Monthly Revenue area chart (12 months, ECharts), Order Status donut chart, Orders per Day bar chart (last 30 days)"),
      b("Row 3: Top 5 Services horizontal bar chart, Recent Orders table (10 rows with quick-assign button), Top Workers mini-table"),
      b("Row 4: Recent Transactions list, Activity Timeline (last 20 order events)"),
      BREAK(),
      H2("8.4 Categories Module"),
      T(
        ["Feature", "Specification"],
        [
          ["List page", "DataTable with: Name, Slug, Status badge, Services count, Sort Order, Created date. Search + filter by status. Sortable columns. Pagination."],
          ["Create/Edit", "AntD Drawer or Modal: Name (required), Slug (auto-generated from name, editable), Description, Icon (text input for AntD icon name), Image upload, Status toggle, Sort Order"],
          ["Delete", "AntD Popconfirm. Block if services exist under this category (show count in error message)."],
          ["Toggle status", "Inline AntD Switch — instant PATCH request, no page reload"],
          ["Manage Fields button", "Each row has a 'Fields' button -> navigates to Admin/Categories/Fields.jsx for that category (CategoryFieldBuilder)"],
          ["Bulk actions", "Checkbox select multiple -> bulk enable / bulk disable / bulk delete (with guard)"],
        ],
        [2000, 7360]
      ),
      BREAK(),
      H2("8.5 Services Module"),
      T(
        ["Feature", "Specification"],
        [
          ["List page", "DataTable: Name, Category badge, Status, Credit Cost, Delivery Days, Revisions, Featured toggle, Actions. Filter by Category + Status. Search by name."],
          ["Create/Edit form", "Category (required, dropdown), Name (required), Slug (auto-gen), Short Description, Full Description (textarea), Image upload, Credit Cost (number), Delivery Days (number), Free Revisions (number), Extra Revision Cost (number), Featured switch, Active switch. Then: Divider 'Category-Specific Fields' + DynamicFieldRenderer (fetches fields when category changes). Values saved to service_field_values."],
          ["Service Steps Builder", "Sub-page: Steps list with add/edit/delete/reorder. Each step: Name, Description, Type (single/multi select), Required toggle, Sort Order. Step options: Label, Description, Credit Add-on, Default toggle, Sort Order."],
          ["Toggle status", "Inline AntD Switch"],
          ["Delete", "Popconfirm. Block if active orders exist for this service."],
        ],
        [2000, 7360]
      ),
      BREAK(),
      H2("8.6 Workers Module"),
      WARN("Admin creates ALL workers. Workers cannot self-register. Registration page is client-only."),
      T(
        ["Feature", "Specification"],
        [
          ["List page", "DataTable: Name, Email, Phone, Status badge, Active Orders count, Completed Orders count, Joined date, Actions"],
          ["Create form", "Name, Email (unique), Phone, Password (manual input or auto-generate button), Profile Photo upload, Bio (textarea), Experience (textarea), Skills (multi-select from skills master list), Services eligible for (multi-select from active services), Status, Notes, Joining Date. On save -> send welcome email with credentials."],
          ["Edit form", "Same as create. Password field is optional (blank = no change)."],
          ["View/Show page", "Profile: photo, bio, skills, services offered. Performance bento: Total Orders, Completed, In Progress, Avg Rating. Order history DataTable. Recent reviews."],
          ["Enable/Disable", "Inline Switch. Disabled worker cannot login (middleware checks status)."],
          ["Delete", "Popconfirm. Block if active orders assigned."],
        ],
        [2000, 7360]
      ),
      BREAK(),
      H2("8.7 Customers Module (View Only)"),
      b("List: Name, Email, Phone, Status, Wallet Balance, Total Orders, Total Spent, Joined date. Search + filter by status."),
      b("Show/detail: Profile info, wallet balance, order history (with status filters), transaction history"),
      b("No create/edit/delete. Admin cannot modify client data (only disable account if needed)."),
      BREAK(),
      H2("8.8 Orders Module"),
      T(
        ["Feature", "Specification"],
        [
          ["List page", "DataTable: Order#, Client name, Service name, Category, Status badge, Credits, Worker (or 'Unassigned' in orange), Created date. Filters: Status, Service, Category, Worker, Date range. Search by order# or client name."],
          ["Assign Worker", "Pending/Assigned orders have 'Assign Worker' button. Opens AntD Modal with: worker dropdown showing eligible workers (those who offer the service) with current active order count shown next to each name. Admin selects worker and saves."],
          ["Reassign Worker", "Available at any status except completed/cancelled. Same modal."],
          ["Cancel Order", "Admin only. Opens modal with required cancellation reason field. On confirm -> credits refunded to client wallet -> status = cancelled."],
          ["Order Detail page", "Bento Grid layout: Order Info card (status, dates, credits, notes), Client Info card, Worker Info card + Assign button, Service + Dynamic Field Values card, Order Timeline (all status changes with timestamps), Comments thread (paginated, with attachment thumbnails), Assets tabs (Reference / Deliverable files), Revision History accordion, Escalations section (if any)."],
        ],
        [2000, 7360]
      ),
      BREAK(),
      H2("8.9 Remaining Admin Modules"),
      b("Credit Packages: CRUD — Name, Price (money), Credits (int), Bonus Credits (int), Active toggle. DataTable with search."),
      b("Public Holidays: CRUD — Name, Date (DatePicker), Active toggle."),
      b("Transactions: Read-only DataTable. Columns: ID, User name, Type badge, Credits, Amount, Reference, Date. Filters: Type, Date range, User search. Export to CSV."),
      b("Escalations: List with Status filter (open/resolved). Show page: order info, client info, escalation message, resolution form (textarea + Submit button). Resolve action sends notification to client."),
      b("Reports: Revenue page with ECharts charts (date range filter), stats cards, top services table, worker performance table. CSV export button."),
      b("Notifications: Bell in header. Dropdown shows latest unread. Mark single read, Mark all read, Delete. Click notification -> redirects to action_url."),
      b("Settings: Key-value form — see Section 11 for full settings list."),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 9 — CLIENT PORTAL (COMPLETE)
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 9 — CLIENT PORTAL (COMPLETE SPECIFICATION)"),

      H2("9.1 Client Sidebar Navigation"),
      T(
        ["Menu Item", "Route", "Notes"],
        [
          ["Dashboard", "client.dashboard", ""],
          ["Browse Services", "client.services.index", ""],
          ["My Orders", "client.orders.index", ""],
          ["My Wallet", "client.wallet.index", ""],
          ["Transactions", "client.transactions.index", ""],
          ["My Profile", "profile.edit", "Shared route"],
        ],
        [2200, 2600, 4560]
      ),
      P("Cart icon shown in top header (not sidebar) — cart item count badge."),
      BREAK(),
      H2("9.2 Client Dashboard"),
      b("StatCards row: Total Orders, Active Orders, Completed Orders, Wallet Balance (credits)"),
      b("Charts: Orders by status donut, Monthly spending bar chart (last 6 months)"),
      b("Recent Orders table (5 rows with quick links to detail)"),
      b("Quick Actions: 'Browse Services' button, 'Top Up Wallet' button"),
      b("Featured Services grid (if any services marked is_featured=true)"),
      BREAK(),
      H2("9.3 Browse Services (Service Catalog)"),
      b("Grid layout — service cards with: image, category badge, name, short_description, credit_cost, delivery_days, featured tag if applicable"),
      b("Sidebar filters: Category (checkbox group), Credit range (slider), Delivery days range"),
      b("Search bar at top"),
      b("Cards are clickable -> Service Detail page"),
      b("Empty state if no services match filters"),
      BREAK(),
      H2("9.4 Service Detail Page"),
      b("Service image, name, category, full description, dynamic field values (displayed read-only as service info)"),
      b("Credit cost displayed prominently"),
      b("Service Steps section: each step shown as a card with its options (radio or checkbox)"),
      b("Client selects options -> running total updates dynamically"),
      b("Notes textarea (optional)"),
      b("'Add to Cart' button -> if already in cart, shows 'Update Cart' and 'Go to Cart'"),
      b("Temporary file upload area per cart item (using AntD Upload dragger)"),
      BREAK(),
      H2("9.5 Cart"),
      b("List of cart items: service name, selected options summary, notes, temp files, credit cost"),
      b("Edit item button -> opens service detail in edit mode"),
      b("Remove item button (Popconfirm)"),
      b("Clear cart button (Popconfirm)"),
      b("Order summary panel: items list, subtotal, total credits, wallet balance, balance after checkout"),
      b("Checkout button -> disabled if insufficient wallet balance (show top-up link in that case)"),
      BREAK(),
      H2("9.6 Checkout"),
      b("Confirmation page: review all items and total before placing"),
      b("'Place Order' button -> calls OrderService.checkout() in a single DB transaction"),
      b("On success: redirect to My Orders with success toast showing N order(s) created"),
      b("On failure (insufficient credits): show error with 'Top Up Wallet' button"),
      BREAK(),
      H2("9.7 My Orders"),
      b("DataTable: Order#, Service, Category, Status badge, Credits, Worker name (or 'Assigned Soon'), Created date"),
      b("Filters: Status, Date range. Search by order#"),
      b("Click row -> Order Detail page"),
      BREAK(),
      H2("9.8 Client Order Detail Page"),
      P("One of the most important pages in the client portal. Must show full order context."),
      T(
        ["Section", "Content"],
        [
          ["Order Info card", "Order #, Service, Status badge with description, Credits used, Date placed, Notes"],
          ["Worker card", "Worker name, photo, bio (if assigned). 'Assigned Soon' placeholder if not yet assigned."],
          ["Service Configuration card", "Dynamic field values for this service (read-only display). Selections from service steps."],
          ["Reference Assets", "Files uploaded by client. 'Add More Files' button (disabled if completed/cancelled)."],
          ["Deliverable Files", "Files uploaded by worker. Download buttons. Only visible after worker submits."],
          ["Comments", "Threaded comments between client and worker. New comment form (text + file attachments). Paginated."],
          ["Revision History", "Accordion list of all revisions with message, status, date."],
          ["Escalation", "If no escalation: 'Escalate Order' button (only when status is not completed/cancelled). If escalation exists: show status and resolution if resolved."],
          ["Actions bar (sticky)", "Context-sensitive: when status=submitted -> 'Approve & Complete' button + 'Request Revision' button. Other statuses -> no action buttons (read only)."],
        ],
        [2400, 6960]
      ),
      BREAK(),
      H2("9.9 Approve & Complete Flow"),
      n("Client clicks 'Approve & Complete' (only available when status = submitted)"),
      n("AntD Modal opens: 'Rate your experience' — star rating (required, 1-5) + review text (optional textarea)"),
      n("Client submits -> OrderService.complete() called -> status = completed, review record created"),
      n("Worker notified"),
      BREAK(),
      H2("9.10 Request Revision Flow"),
      n("Client clicks 'Request Revision' (available when status = submitted)"),
      n("AntD Modal opens: Message textarea (required) + optional file upload"),
      n("If existing revision count >= service.revisions AND extra_revision_cost > 0: show warning 'This revision will cost X credits'"),
      n("Client confirms -> credits deducted if applicable -> revision record created -> status = revision_requested -> in_progress -> worker notified"),
      BREAK(),
      H2("9.11 Wallet"),
      b("Balance display: large credit number, last updated date"),
      b("Recent transactions mini-table (last 5 with 'View All' link)"),
      b("'Top Up' button -> Topup page"),
      BREAK(),
      H2("9.12 Top Up Wallet (Stripe)"),
      b("Credit packages grid: each package shows name, price, credits, bonus credits, total credits"),
      b("Client selects package -> 'Pay with Stripe' button"),
      b("Stripe Checkout Session created server-side -> redirect to Stripe"),
      b("On success: Stripe webhook (checkout.session.completed) -> idempotency check (transaction reference = stripe_{session_id}) -> credits added to wallet -> transaction record created"),
      b("Success page: /client/wallet/topup/success (shows credits added)"),
      b("Cancel page: /client/wallet/topup/cancel (back to wallet)"),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 10 — WORKER PORTAL (COMPLETE)
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 10 — WORKER PORTAL (COMPLETE SPECIFICATION)"),
      WARN("WORKERS DO NOT BROWSE OR ACCEPT JOBS. WORKER PORTAL ONLY SHOWS ORDERS ADMIN HAS ASSIGNED TO THEM."),

      H2("10.1 Worker Sidebar Navigation"),
      T(
        ["Menu Item", "Route", "Notes"],
        [
          ["Dashboard", "worker.dashboard", ""],
          ["My Orders", "worker.orders.index", "All orders assigned to this worker"],
          ["My Profile", "profile.edit", "Shared route"],
        ],
        [2000, 2600, 4760]
      ),
      P("No 'Available Jobs' link. No browsing. No accepting. Admin-assigned only."),
      BREAK(),
      H2("10.2 Worker Dashboard"),
      b("StatCards: Assigned Orders, In Progress, Submitted (awaiting client review), Completed, Revision Requested (highlighted)"),
      b("Chart: Orders by status donut, Monthly completed orders bar chart"),
      b("Recent Orders table (5 rows)"),
      b("Performance summary: Completion Rate %, Average Rating, Total Credits Earned (informational only)"),
      BREAK(),
      H2("10.3 My Orders (Worker)"),
      b("DataTable: Order#, Client name (first name only for privacy), Service, Category, Status badge, Date Assigned, Deadline (estimated from delivery_days), Actions"),
      b("Status filter. Search by order#."),
      b("Status badges color-coded: assigned (blue), in_progress (orange), submitted (purple), revision_requested (red), completed (green)"),
      BREAK(),
      H2("10.4 Worker Order Detail Page"),
      P("Key page for the worker. Must be clear and action-focused."),
      T(
        ["Section", "Content"],
        [
          ["Order Info card", "Order#, Service, Status, Date Assigned, Deadline, Credits (informational — worker sees this as their job value). Notes from client."],
          ["Service Configuration", "What the client ordered: selected options, dynamic field values (read-only). Helps worker understand the scope."],
          ["Reference Assets", "Files uploaded by client. Worker can download. Cannot upload here."],
          ["Submit Deliverable (main action)", "AntD Upload Dragger. Multiple files allowed. 'Submit Delivery' button. Disabled unless status = in_progress or assigned. On submit: files stored as type=deliverable, status -> submitted, pending revisions resolved, client notified."],
          ["Comments", "Thread between worker and client. New message form. File attachments supported. Client notified on new comment."],
          ["Revision History", "Read-only list of all revision requests with message and status."],
        ],
        [2400, 6960]
      ),
      BREAK(),
      H2("10.5 Worker Profile"),
      b("Edit: Name, Phone, Profile Photo upload, Bio, Experience"),
      b("Skills: multi-select from skills master list — affects which services worker can be assigned to"),
      b("Services offered: admin-controlled (worker cannot change which services they appear for)"),
      b("Password change section: current password + new password + confirm"),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 11 — PLATFORM SETTINGS
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 11 — PLATFORM SETTINGS"),
      P("Stored in settings table as key/value pairs. Managed by admin on the Settings page. Accessed in code via a setting() helper function."),
      T(
        ["Key", "Type", "Default", "Description"],
        [
          ["platform_name", "string", "ServicePro", "Platform display name shown in header and emails"],
          ["support_email", "string", "", "Support contact email shown to clients"],
          ["currency_symbol", "string", "Credits", "Label shown next to all credit amounts"],
          ["logo_url", "file upload", "", "Platform logo"],
          ["favicon_url", "file upload", "", "Browser favicon"],
          ["auto_assign_worker", "boolean", "false", "If true, server-side auto-assigns first eligible worker on order creation"],
          ["max_active_orders_per_worker", "integer", "5", "Max concurrent assigned+in_progress orders per worker"],
          ["notify_worker_on_new_order", "boolean", "true", "Send notification to worker when admin assigns them"],
          ["notify_client_on_order_accepted", "boolean", "true", "Send notification to client when worker is assigned"],
          ["notify_client_on_order_completed", "boolean", "true", "Send notification to client when order is completed"],
          ["enable_in_app_notifications", "boolean", "true", "Master toggle for all in-app notifications"],
          ["min_credit_purchase", "integer", "100", "Minimum credits in a single top-up"],
          ["max_file_upload_size_mb", "integer", "10", "Max upload file size in MB"],
          ["allowed_file_types", "string", "jpg,png,pdf,doc,docx,zip", "Comma-separated allowed extensions"],
          ["stripe_public_key", "string", "", "Stripe publishable key"],
          ["stripe_secret_key", "encrypted string", "", "Stripe secret key (stored encrypted)"],
          ["stripe_webhook_secret", "encrypted string", "", "Stripe webhook signing secret"],
        ],
        [2600, 1400, 1200, 4160]
      ),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 12 — UI/UX STANDARDS
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 12 — UI/UX & COMPONENT STANDARDS"),

      H2("12.1 Color Palette"),
      T(
        ["Token", "Hex", "Usage"],
        [
          ["Primary Blue", "#3B82F6", "Buttons, links, active states, focus rings"],
          ["Primary Hover", "#1D4ED8", "Button hover"],
          ["Admin Sidebar BG", "#0F172A", "Admin sidebar only"],
          ["Surface", "#FFFFFF", "Cards, modals, form backgrounds"],
          ["Page BG", "#F8FAFC", "Main content area for all portals"],
          ["Border", "#E2E8F0", "Tables, cards, dividers"],
          ["Text Primary", "#0F172A", "Headings, body text"],
          ["Text Secondary", "#64748B", "Labels, captions, helper text"],
          ["Status: Pending", "#F59E0B / amber", "Pending badge"],
          ["Status: Assigned", "#3B82F6 / blue", "Assigned badge"],
          ["Status: In Progress", "#8B5CF6 / violet", "In progress badge"],
          ["Status: Submitted", "#06B6D4 / cyan", "Submitted badge"],
          ["Status: Completed", "#10B981 / emerald", "Completed badge"],
          ["Status: Cancelled", "#6B7280 / gray", "Cancelled badge"],
          ["Status: Revision", "#EF4444 / red", "Revision requested badge"],
        ],
        [1800, 1600, 5960]
      ),
      BREAK(),
      H2("12.2 Component Standards — Every Page Must Follow"),
      b("Page Header: every page has <PageHeader title='...' breadcrumbs={[...]} actions={[<Button>...]} />"),
      b("Tables: every list uses <DataTable> with search, filters, sortable columns, pagination, export button"),
      b("Status: always use <StatusBadge status={order.status} /> — never hardcode color tags"),
      b("Delete: always use AntD Popconfirm or Modal.confirm — NEVER browser confirm()"),
      b("Forms: label above input (never side-by-side), AntD Form.Item with name+rules, help text via extra prop"),
      b("Submit buttons: disabled + loading spinner while submitting (use Inertia processing state)"),
      b("Empty states: always render <EmptyState icon={...} title='No X found' description='...' action={<Button>Create</Button>} />"),
      b("Skeletons: AntD Skeleton on initial data load, AntD Spin on refresh"),
      b("Modals: title + content + footer with 'Cancel' (default) + 'Confirm' (primary or danger) buttons"),
      BREAK(),
      H2("12.3 Bento Grid — Where to Use"),
      b("Admin Dashboard — StatCards + charts in a non-uniform CSS grid (grid-cols-12 with varying col-span)"),
      b("Admin Order Detail — order info, client info, worker info arranged in bento cells"),
      b("Admin Worker Show — performance metrics + profile info"),
      b("Client Dashboard — stats + featured services"),
      b("Worker Dashboard — stats + recent orders"),
      P("Implementation: Tailwind CSS grid — grid-cols-12, col-span-3/4/6/8/12 based on content size."),
      BREAK(),
      H2("12.4 Layout Differences Per Portal"),
      T(
        ["Portal", "Sidebar Style", "Header Extras", "Color Accent"],
        [
          ["Admin", "Dark (#0F172A bg), white text, collapsible", "Notifications bell + Profile dropdown + Breadcrumbs", "Blue primary on dark"],
          ["Client", "Light/white bg, gray text, active=blue", "Cart icon with count + Notifications bell + Profile dropdown", "Blue primary on light"],
          ["Worker", "Light/white bg, minimal, 3 items only", "Notifications bell + Profile dropdown", "Blue primary on light"],
        ],
        [1200, 2600, 2800, 2760]
      ),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 13 — MANDATORY EXECUTION ORDER (PHASES)
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 13 — MANDATORY EXECUTION ORDER (ALL PHASES)"),
      WARN("Follow this EXACT order. Do not skip phases. Note your phase/step number when stopping. Resume exactly where you left off."),
      BREAK(),

      H2("PHASE 1 — Foundation & Authentication"),
      P("Estimated steps: 8", { color: "64748B" }),
      n("Laravel 13 project setup — install all packages (Breeze Inertia, AntD, TailwindCSS, ECharts, Stripe SDK)"),
      n("Migrations: users (with role+status enums), wallets, settings"),
      n("User model with UserRole enum, wallet() hasOne relationship, status check method"),
      n("EnsureRole middleware — blocks wrong-role routes with 403"),
      n("Auth pages: Login (all roles), Register (client only — hardcode role=client, block worker), Forgot Password, Reset Password"),
      n("Login -> role-based redirect: admin -> /admin/dashboard, client -> /client/dashboard, worker -> /worker/dashboard"),
      n("AuthLayout.jsx — clean centered card, logo area, consistent form design"),
      n("Admin seeder: creates default admin account (admin@example.com / password)"),
      NOTE("CHECKPOINT: All auth flows working. Role redirect working. Middleware blocks wrong roles. Admin seeder creates account."),
      BREAK(),

      H2("PHASE 2 — Admin Layout & Shared Components"),
      P("Estimated steps: 6", { color: "64748B" }),
      n("AdminLayout.jsx — dark sidebar (#0F172A), all navigation items, header with notification bell + profile dropdown, breadcrumbs"),
      n("Common components: PageHeader.jsx, StatCard.jsx, ChartCard.jsx, DataTable.jsx (base), StatusBadge.jsx, ConfirmModal.jsx, EmptyState.jsx, FilterBar.jsx"),
      n("BentoGrid.jsx utility component"),
      n("constants.js — STATUS_COLORS map, FIELD_TYPES list"),
      n("Admin dashboard placeholder page that loads without errors"),
      n("Test: all sidebar links work, layout renders, responsive collapse works"),
      NOTE("CHECKPOINT: Admin layout renders. Navigation works. All shared components importable without errors."),
      BREAK(),

      H2("PHASE 3 — Categories Module"),
      P("Estimated steps: 5", { color: "64748B" }),
      n("Migration: categories table"),
      n("Category model, CategoryPolicy, CategoryRequest (store + update)"),
      n("CategoryController (index, store, update, destroy, toggleStatus) + CategoryService"),
      n("Admin/Categories/Index.jsx — DataTable with search, status filter, inline status toggle, bulk actions, image preview, delete with guard"),
      n("Create/Edit in AntD Drawer — Name, Slug (auto-gen), Description, Icon, Image upload, Status, Sort Order"),
      NOTE("CHECKPOINT: Full categories CRUD working. Image upload works. Bulk actions work. Block delete if services exist."),
      BREAK(),

      H2("PHASE 4 — Category Fields (Dynamic Fields Engine)"),
      P("Estimated steps: 6 — CRITICAL MODULE", { color: "64748B" }),
      n("Migration: category_fields table (all columns from Section 5.3)"),
      n("CategoryField model, CategoryFieldPolicy, StoreCategoryFieldRequest"),
      n("CategoryFieldController (index, store, update, destroy, reorder) + CategoryFieldService"),
      n("API endpoint: GET /admin/categories/{category}/fields/for-form — returns field schema for renderer"),
      n("Admin/Categories/Fields.jsx — CategoryFieldBuilder: field list with drag-to-reorder, Add/Edit Drawer with all field type options and smart auto-suggest, Delete with Popconfirm"),
      n("DynamicFieldRenderer.jsx — renders all 16 field types correctly as AntD form items with proper validation rules"),
      NOTE("CHECKPOINT: Admin can define fields for a category. DynamicFieldRenderer renders all types. for-form API returns correct schema."),
      BREAK(),

      H2("PHASE 5 — Services Module"),
      P("Estimated steps: 7", { color: "64748B" }),
      n("Migrations: services, service_field_values, service_steps, service_step_options"),
      n("Service model + relationships, ServicePolicy, StoreServiceRequest"),
      n("ServiceController (index, store, update, destroy, toggleStatus) + ServiceService"),
      n("Admin/Services/Index.jsx — DataTable with category + status filters"),
      n("Admin/Services/Form.jsx — Create/Edit: standard fields + category dropdown (onChange triggers dynamic fields load via useDynamicFields hook) + DynamicFieldRenderer renders below. On save: service_field_values saved/updated."),
      n("Admin/Services/Steps.jsx — Steps Builder: CRUD + reorder for steps and options"),
      n("useDynamicFields.js hook — fetches and caches category fields by category_id"),
      NOTE("CHECKPOINT: Create a service under 'AC Repair' -> brand/type fields appear. Change to 'Web Dev' -> different fields appear. Values save correctly."),
      BREAK(),

      H2("PHASE 6 — Workers Module (Admin Side)"),
      P("Estimated steps: 5", { color: "64748B" }),
      n("Migrations: worker_profiles, skills, user_skills pivot, service_worker pivot"),
      n("WorkerProfile model, Skill model, WorkerController (index, create, store, edit, update, show, toggleStatus), StoreWorkerRequest, WorkerService"),
      n("Admin/Workers/Index.jsx — DataTable with status filter, active orders count, completed orders count"),
      n("Admin/Workers/Form.jsx — full create/edit form with skills multi-select, services multi-select, password auto-generate button, welcome email on create"),
      n("Admin/Workers/Show.jsx — bento profile: photo + bio, skills/services chips, performance stats cards, order history table, recent reviews list"),
      NOTE("CHECKPOINT: Admin creates worker -> welcome email sent -> worker logs in -> sees worker portal dashboard."),
      BREAK(),

      H2("PHASE 7 — Orders Module (Core)"),
      P("Estimated steps: 9 — MOST COMPLEX MODULE", { color: "64748B" }),
      n("Migrations: orders, order_assets, order_selections, revisions, reviews, escalations, order_comments"),
      n("All models: Order (with OrderStatus enum), OrderAsset, OrderSelection, Revision, Review, Escalation, OrderComment"),
      n("OrderPolicy (client sees own orders only, worker sees assigned orders only, admin sees all)"),
      n("OrderService: assign(), complete(), requestRevision(), cancel(), submitDelivery()"),
      n("Events + Listeners: OrderAssigned, OrderSubmitted, OrderCompleted, RevisionRequested, EscalationResolved, CommentPosted — each fires corresponding Notification"),
      n("All Notification classes: in-app (database channel) + email templates"),
      n("Admin/Orders/Index.jsx — DataTable with all filters, quick-assign button on pending rows"),
      n("Admin/Orders/Show.jsx — full bento detail page (order/client/worker cards, assign modal, timeline, comments, assets tabs, revisions, escalations)"),
      n("Test assign flow: Admin creates worker, places test order as client, admin assigns worker, worker sees it in portal"),
      NOTE("CHECKPOINT: Admin can assign a worker to a pending order. Worker sees it immediately in their portal. Notifications sent to both parties."),
      BREAK(),

      H2("PHASE 8 — Remaining Admin Modules"),
      P("Estimated steps: 7", { color: "64748B" }),
      n("Credit Packages: Migration, model, controller, CRUD pages (Index.jsx with inline toggle)"),
      n("Public Holidays: Migration, model, controller, CRUD pages"),
      n("Customers/Index.jsx + Customers/Show.jsx (view-only, with order + transaction history)"),
      n("Transactions/Index.jsx — read-only DataTable with type/date filters and CSV export"),
      n("Escalations/Index.jsx + Escalations/Show.jsx — list + detail + resolve action"),
      n("Reports/Revenue.jsx — ECharts area chart + donut + bar charts + top services/workers tables + date range filter + CSV export (ReportService)"),
      n("Settings/Index.jsx — all settings from Section 11 as a form (booleans as Switch, integers as InputNumber, strings as Input, file uploads for logo/favicon)"),
      NOTE("CHECKPOINT: All admin modules functional and visually consistent. Settings save correctly."),
      BREAK(),

      H2("PHASE 9 — Admin Dashboard (Live Data)"),
      P("Estimated steps: 4", { color: "64748B" }),
      n("Connect all StatCards to real DB queries in AdminDashboardController"),
      n("Wire ECharts: revenue area chart (12 months from transactions), order status donut, orders per day bar (30 days), top 5 services horizontal bar"),
      n("Recent orders + transactions tables with real data and links to detail pages"),
      n("Bento grid layout finalized, all widgets responsive"),
      NOTE("CHECKPOINT: Dashboard shows live data. All charts render. Bento grid looks professional."),
      BREAK(),

      H2("PHASE 10 — Client Layout, Auth & Dashboard"),
      P("Estimated steps: 4", { color: "64748B" }),
      n("ClientLayout.jsx — light sidebar, cart icon with count in header, notifications bell"),
      n("Client register page (role hardcoded to client), post-register -> email verification -> client dashboard"),
      n("Client/Dashboard/Index.jsx — stats cards, charts, recent orders, featured services, quick actions"),
      n("Cart state management — CartContext or Inertia shared data for cart count"),
      NOTE("CHECKPOINT: Client can register, login, see dashboard. Cart count shows in header."),
      BREAK(),

      H2("PHASE 11 — Client Services & Cart"),
      P("Estimated steps: 5", { color: "64748B" }),
      n("Client/Services/Index.jsx — service catalog grid with category filters, credit range slider, search"),
      n("Client/Services/Show.jsx — service detail with dynamic field values display, step configuration (radio/checkbox per step type), running total, notes, temp file upload"),
      n("CartController (add, update, remove, clear) + cart storage (session or cart table)"),
      n("Client/Cart/Index.jsx — cart items list, edit/remove actions, order summary panel, checkout button"),
      n("Client/Cart/Checkout.jsx — order review + place order action -> OrderService.checkout()"),
      NOTE("CHECKPOINT: Client can browse, configure, add to cart, and place orders. Credits deducted. Orders appear in admin panel."),
      BREAK(),

      H2("PHASE 12 — Client Orders Portal"),
      P("Estimated steps: 5", { color: "64748B" }),
      n("Client/Orders/Index.jsx — orders DataTable with status filter"),
      n("Client/Orders/Show.jsx — full detail page (Section 9.8): order info, worker card, service config, reference assets, deliverable files, comments, revisions, escalation, action bar"),
      n("Complete order flow: 'Approve & Complete' modal with star rating + review text"),
      n("Request revision flow: modal with message + optional files + credit warning if extra revision"),
      n("Comment system: post text + attach files, paginated thread"),
      NOTE("CHECKPOINT: Client can view orders, complete them with rating, request revisions, post comments. All status transitions work."),
      BREAK(),

      H2("PHASE 13 — Client Wallet & Stripe"),
      P("Estimated steps: 4", { color: "64748B" }),
      n("Client/Wallet/Index.jsx — balance display + recent transactions mini-table + Top Up button"),
      n("Client/Transactions/Index.jsx — full transaction history with type filter"),
      n("Client/Wallet/Topup.jsx — credit packages grid, 'Pay with Stripe' button"),
      n("Stripe Checkout: create session server-side, handle checkout.session.completed webhook (with idempotency check), add credits to wallet, create transaction record"),
      NOTE("CHECKPOINT: Client can top up wallet with Stripe. Credits added after payment. Transaction recorded."),
      BREAK(),

      H2("PHASE 14 — Worker Portal"),
      P("Estimated steps: 5", { color: "64748B" }),
      n("WorkerLayout.jsx — minimal light sidebar (3 items only), notifications bell"),
      n("Worker/Dashboard/Index.jsx — stats cards (assigned/in-progress/submitted/completed/revision-requested), charts, recent orders table"),
      n("Worker/Orders/Index.jsx — assigned orders DataTable with status filter, deadline column"),
      n("Worker/Orders/Show.jsx — order detail (Section 10.4): service config, reference assets download, submit deliverable upload dragger, comments thread, revision history"),
      n("Worker/Profile/Index.jsx — edit name/phone/photo/bio/experience + skills multi-select + password change"),
      NOTE("CHECKPOINT: Worker sees only their assigned orders. Can submit deliverables. Can post comments. Cannot see other workers' orders."),
      BREAK(),

      H2("PHASE 15 — Polish & Validation"),
      P("Estimated steps: 5 — Final phase", { color: "64748B" }),
      n("Audit every page for visual consistency: spacing, typography, empty states, skeleton loaders"),
      n("Verify all Form Request validations have matching frontend AntD Form validation rules"),
      n("Test all email notification templates render correctly"),
      n("Test Stripe webhook in development (Stripe CLI)"),
      n("Final check: all 3 portals completely isolated, no cross-portal data leaks, all policies enforced"),
      NOTE("CHECKPOINT: Full end-to-end test: Register client -> buy credits -> place order -> admin assigns worker -> worker submits -> client approves. All notifications sent."),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // SECTION 14 — CODE QUALITY RULES
      // ═══════════════════════════════════════════════════════════
      H1("SECTION 14 — CODE QUALITY RULES (NON-NEGOTIABLE)"),

      H2("14.1 Laravel Rules"),
      b("Controllers: HTTP request/response ONLY. Zero business logic. Thin."),
      b("Services: ALL business logic. Injected via constructor DI."),
      b("Form Requests: ALL input validation. Zero inline $request->validate() calls."),
      b("Policies: ALL authorization. Zero inline auth()->user()->role checks."),
      b("Enums: PHP 8.1 backed enums for every status, role, and type field."),
      b("Events/Listeners: Order lifecycle always fires Events (never send notifications from controllers)."),
      b("Notifications: Dedicated Notification class per event, supports both 'database' and 'mail' channels."),
      b("DB Transactions: wrap() any operation that touches multiple tables (order placement, wallet deduction)."),
      BREAK(),
      H2("14.2 React Rules"),
      b("Functional components ONLY. No class components anywhere."),
      b("Custom hooks for all reusable logic: useTable, useFilters, useDynamicFields."),
      b("No business logic inside Page components — call controllers/services."),
      b("No inline styles. TailwindCSS classes or AntD theme tokens only."),
      b("Consistent prop naming: onSuccess, onError, loading, data across all components."),
      b("useMemo/useCallback on expensive renders and frequently-passed callbacks."),
      BREAK(),
      H2("14.3 Consistency Rules"),
      b("Every form: label above input, AntD Form.Item with name+label+rules, help text via extra prop — same layout on every page in every portal."),
      b("Every table: search bar + FilterBar + sortable column headers + pagination footer + export button."),
      b("Primary action button: type='primary'. Secondary: type='default'. Destructive: danger={true}."),
      b("Every modal: title in header, content in body, Cancel (default) + Confirm (primary/danger) in footer."),
      b("Every delete action: Popconfirm or Modal.confirm. Never browser native confirm()."),
      b("Every form submit: button goes loading while Inertia is processing. Re-enables on response."),
      b("Every empty list: EmptyState component — never just show nothing."),
      HR(),

      // ═══════════════════════════════════════════════════════════
      // FIRST ACTION
      // ═══════════════════════════════════════════════════════════
      H1("YOUR FIRST ACTION"),
      P("After reading this entire prompt, respond with:", { bold: true }),
      n("Confirm you have read and understood all 14 sections."),
      n("State the Phase 1 tasks you will begin with (list the 8 steps)."),
      n("Ask only genuinely ambiguous questions — keep it to maximum 2 questions."),
      n("Then begin Phase 1 — writing complete, production-ready code immediately."),
      BREAK(),
      WARN("Do NOT write placeholder code. Do NOT write TODO comments. Every function must be fully implemented."),
      P("Complete each phase fully and announce 'PHASE X COMPLETE — CHECKPOINT PASSED' before starting the next phase."),
      BREAK(),
      P("If resuming a session: state which Phase and Step you are on, then continue from exactly that point.", { bold: true, color: "1E40AF" }),
      HR(),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 120 },
        children: [new TextRun({ text: "END OF MASTER SPECIFICATION v3.0", bold: true, size: 24, color: "3B82F6", font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Service Marketplace Platform  •  Laravel 13 + React + Inertia.js + Ant Design  •  3 Portals  •  15 Phases", size: 20, color: "94A3B8", italics: true, font: "Calibri" })]
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/ServiceMarketplace_MasterPrompt_v3.docx', buffer);
  console.log('Done!');
}).catch(err => {
  console.error(err);
  process.exit(1);
});