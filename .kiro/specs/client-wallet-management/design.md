# Technical Design Document

## Overview

The Client Wallet Management feature provides a comprehensive frontend interface for clients to view their wallet balance, browse transaction history, and access credit top-up functionality. This feature integrates seamlessly with existing wallet infrastructure while maintaining the established Laravel + React + Inertia.js + Ant Design architectural patterns.

### Scope

This design covers:
- Three client-facing pages: Wallet Index, Transaction History, and Top-Up Display
- WalletController with three HTTP endpoints
- TransactionType enum for type safety
- Form Request validation for transaction filtering
- Integration with existing Wallet, WalletTransaction models, and WalletService
- React components following established UI patterns

### Out of Scope

- Stripe payment integration (handled in subsequent phases)
- WalletService business logic (already exists)
- Admin wallet management interfaces
- Real-time balance updates via WebSockets

### Key Architectural Decisions

1. **Controller Pattern**: HTTP-only controllers with zero business logic, delegating all operations to existing WalletService
2. **Transaction Types**: PHP 8.4 backed enum for compile-time type safety
3. **Filtering Strategy**: Query parameter-based filtering with Form Request validation
4. **Component Reuse**: Leverage all existing common components (DataTable, StatusBadge, EmptyState, PageHeader)
5. **Data Loading**: Eager loading of relationships to prevent N+1 queries
6. **State Management**: URL query parameters as source of truth for filter state

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Pages    │  Wallet/Index, Wallet/Topup, Transactions/Index
└────────┬────────┘
         │ Inertia Props
         ▼
┌─────────────────┐
│ WalletController│  index(), topup(), transactions()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Eloquent Models │  Wallet, WalletTransaction, User
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  wallets, wallet_transactions tables
└─────────────────┘
```

### Request Flow

1. **Wallet Index Request**:
   ```
   GET /client/wallet
   → WalletController@index
   → Load user->wallet, last 5 transactions
   → Inertia::render('Client/Wallet/Index', [...])
   → React renders balance + recent transactions
   ```

2. **Transactions Request**:
   ```
   GET /client/wallet/transactions?type=credit_purchase&date_from=2024-01-01
   → WalletController@transactions
   → Validate via TransactionFilterRequest
   → Query with filters, paginate(15)
   → Inertia::render('Client/Transactions/Index', [...])
   → React renders filtered, paginated table
   ```

3. **Top-Up Page Request**:
   ```
   GET /client/wallet/topup
   → WalletController@topup
   → Load CreditPackage::where('is_active', true)->get()
   → Inertia::render('Client/Wallet/Topup', [...])
   → React renders package cards
   ```

### Layering Strategy

```
┌────────────────────────────────────────┐
│         Presentation Layer             │  React Components
│  (Display, User Interaction)           │  (Wallet/Index, Transactions/Index)
└──────────────────┬─────────────────────┘
                   │ Props via Inertia
┌──────────────────▼─────────────────────┐
│         HTTP Layer                      │  WalletController
│  (Request Handling, Validation)         │  (Routes, Form Requests)
└──────────────────┬─────────────────────┘
                   │ Method Calls
┌──────────────────▼─────────────────────┐
│         Data Layer                      │  Eloquent ORM
│  (Models, Relationships)                │  (Wallet, WalletTransaction)
└──────────────────┬─────────────────────┘
                   │ SQL Queries
┌──────────────────▼─────────────────────┐
│         Database                        │  MySQL Tables
└─────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. WalletController

**Location**: `app/Http/Controllers/Client/WalletController.php`

**Purpose**: Handle HTTP requests for client wallet operations

**Methods**:

```php
class WalletController extends Controller
{
    public function index(): Response
    {
        // Load user's wallet with last 5 transactions
        // Return Inertia response to Client/Wallet/Index
    }

    public function transactions(TransactionFilterRequest $request): Response
    {
        // Load filtered, paginated transactions
        // Return Inertia response to Client/Transactions/Index
    }

    public function topup(): Response
    {
        // Load active credit packages
        // Return Inertia response to Client/Wallet/Topup
    }
}
```

**Dependencies**:
- `Inertia\Inertia` for rendering
- `App\Models\Wallet` for wallet access
- `App\Models\WalletTransaction` for transaction queries
- `App\Models\CreditPackage` for package listings
- `App\Http\Requests\Client\TransactionFilterRequest` for validation

**Middleware**:
- `auth` - Requires authenticated user
- `role:client` - Restricts to client role only

#### 2. TransactionFilterRequest

**Location**: `app/Http/Requests/Client/TransactionFilterRequest.php`

**Purpose**: Validate transaction filtering parameters

**Rules**:

```php
class TransactionFilterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'type' => ['nullable', 'string', Rule::enum(TransactionType::class)],
            'date_from' => ['nullable', 'date', 'before_or_equal:date_to'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
```

#### 3. TransactionType Enum

**Location**: `app/Enums/TransactionType.php`

**Purpose**: Type-safe transaction type constants

**Definition**:

```php
enum TransactionType: string
{
    case CreditPurchase = 'credit_purchase';
    case OrderPayment = 'order_payment';
    case OrderRefund = 'order_refund';
    case RevisionCharge = 'revision_charge';

    public function label(): string
    {
        return match($this) {
            self::CreditPurchase => 'Credit Purchase',
            self::OrderPayment => 'Order Payment',
            self::OrderRefund => 'Order Refund',
            self::RevisionCharge => 'Revision Charge',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::CreditPurchase => 'blue',
            self::OrderPayment => 'orange',
            self::OrderRefund => 'green',
            self::RevisionCharge => 'red',
        };
    }
}
```

### Frontend Components

#### 1. Wallet Index Page

**Location**: `resources/js/Pages/Client/Wallet/Index.jsx`

**Purpose**: Display wallet balance and recent transactions

**Props**:
- `wallet: { id: number, balance: number }` - User's wallet data
- `recentTransactions: Array<Transaction>` - Last 5 transactions

**Structure**:

```jsx
<ClientLayout>
  <PageHeader title="My Wallet" breadcrumbs={[...]} actions={[TopUpButton]} />
  
  <Card className="balance-card">
    <Statistic
      title="Available Credits"
      value={wallet.balance}
      formatter={(value) => number_format(value)}
    />
  </Card>

  <Card title="Recent Transactions" extra={<ViewAllLink />}>
    {recentTransactions.length > 0 ? (
      <Table columns={miniColumns} dataSource={recentTransactions} pagination={false} />
    ) : (
      <EmptyState icon={<WalletOutlined />} title="No transactions yet" />
    )}
  </Card>
</ClientLayout>
```

#### 2. Transaction History Page

**Location**: `resources/js/Pages/Client/Transactions/Index.jsx`

**Purpose**: Display filterable, paginated transaction history

**Props**:
- `transactions: PaginatedData<Transaction>` - Paginated transaction list
- `filters: { type?: string, date_from?: string, date_to?: string }` - Current filters

**Structure**:

```jsx
<ClientLayout>
  <PageHeader title="Transaction History" breadcrumbs={[...]} />
  
  <FilterBar>
    <Select
      placeholder="All Types"
      value={filters.type}
      onChange={(type) => applyFilter({ type })}
      options={TYPE_OPTIONS}
    />
    <RangePicker
      value={[filters.date_from, filters.date_to]}
      onChange={(dates) => applyFilter({ date_from: dates[0], date_to: dates[1] })}
    />
  </FilterBar>

  <DataTable
    columns={transactionColumns}
    dataSource={transactions.data}
    pagination={paginationConfig}
  />
</ClientLayout>
```

**Transaction Columns**:
- Date (formatted as "MMM D, YYYY h:mm A")
- Type (StatusBadge with color based on TransactionType)
- Description (text with order link if order_id exists)
- Credits (colored: green for additions, red for deductions)

#### 3. Top-Up Page

**Location**: `resources/js/Pages/Client/Wallet/Topup.jsx`

**Purpose**: Display available credit packages for purchase

**Props**:
- `packages: Array<CreditPackage>` - Available credit packages

**Structure**:

```jsx
<ClientLayout>
  <PageHeader title="Top Up Credits" breadcrumbs={[...]} />
  
  {packages.length > 0 ? (
    <Row gutter={[16, 16]}>
      {packages.map((pkg) => (
        <Col key={pkg.id} xs={24} sm={12} lg={8}>
          <PackageCard package={pkg} />
        </Col>
      ))}
    </Row>
  ) : (
    <EmptyState
      icon={<WalletOutlined />}
      title="No packages available"
      description="Credit packages will be available soon."
    />
  )}
</ClientLayout>
```

### Routes

**Location**: `routes/client.php`

```php
Route::middleware(['auth', 'role:client'])->prefix('client')->name('client.')->group(function () {
    // ... existing routes ...

    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::get('/wallet/topup', [WalletController::class, 'topup'])->name('wallet.topup');
    Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('transactions.index');
});
```

### Integration Points

#### Existing Models (No Modifications Required)

1. **Wallet Model**: Already has `balance` field and `user()` relationship
2. **WalletTransaction Model**: Already has all required fields (user_id, order_id, type, credits, amount, reference, description)
3. **User Model**: Already has `wallet()` relationship
4. **CreditPackage Model**: Already exists for admin-created packages

#### Existing Components (Reused As-Is)

1. **ClientLayout**: Provides sidebar navigation with "My Wallet" and "Transactions" menu items
2. **PageHeader**: Displays page title and breadcrumbs
3. **DataTable**: Handles table rendering and pagination
4. **StatusBadge**: Displays colored badges for transaction types
5. **EmptyState**: Shows empty state messages
6. **FilterBar**: Provides filtering UI (to be created if doesn't exist, or inline filtering as shown in Orders/Index)

## Data Models

### Existing Database Schema

All required tables already exist. No migrations needed.

#### wallets table
```
id: bigint unsigned (PK)
user_id: bigint unsigned (FK → users.id) UNIQUE
balance: integer DEFAULT 0
created_at: timestamp
updated_at: timestamp
```

#### wallet_transactions table
```
id: bigint unsigned (PK)
user_id: bigint unsigned (FK → users.id)
order_id: bigint unsigned (FK → orders.id) NULLABLE
type: enum('credit_purchase', 'order_payment', 'order_refund', 'revision_charge')
credits: integer
amount: decimal(10,2) NULLABLE
reference: string NULLABLE
description: text NULLABLE
created_at: timestamp
updated_at: timestamp

INDEX idx_user_id (user_id)
INDEX idx_type (type)
INDEX idx_created_at (created_at)
```

### Eloquent Relationships

```php
// User.php (existing)
public function wallet(): HasOne
{
    return $this->hasOne(Wallet::class);
}

public function walletTransactions(): HasMany
{
    return $this->hasMany(WalletTransaction::class);
}

// Wallet.php (existing)
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

// WalletTransaction.php (existing)
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

public function order(): BelongsTo
{
    return $this->belongsTo(Order::class);
}
```

### Query Optimization Strategies

1. **Eager Loading**: Always eager load relationships to prevent N+1
   ```php
   $transactions = WalletTransaction::with('order:id,reference')
       ->where('user_id', $userId)
       ->latest()
       ->paginate(15);
   ```

2. **Index Usage**: Queries leverage existing indexes on user_id, type, created_at

3. **Wallet Retrieval**: Use `firstOrCreate()` to handle cases where wallet doesn't exist yet
   ```php
   $wallet = auth()->user()->wallet()->firstOrCreate(['user_id' => auth()->id()], ['balance' => 0]);
   ```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining correctness properties, I need to assess whether property-based testing is appropriate for this feature.

**PBT Applicability Assessment**:

This feature is primarily:
- UI rendering (React components displaying wallet data)
- HTTP request handling (controllers passing data to views)
- Data filtering and pagination (Eloquent queries)
- No complex algorithms or transformations
- No parsing, serialization, or round-trip operations
- Simple CRUD operations with display logic

**Decision**: Property-based testing is **NOT appropriate** for this feature.

**Rationale**:
- The feature consists of UI components that render data (use snapshot/visual regression tests)
- Controllers are HTTP-only with no business logic (use integration tests)
- Data queries are standard Eloquent operations (use example-based tests)
- Transaction type handling is display logic, not transformation logic
- No universal properties that hold across infinite inputs

**Alternative Testing Strategy**:
- **Controller Tests**: Example-based integration tests verifying correct data is returned
- **Component Tests**: React Testing Library tests for user interactions
- **Feature Tests**: End-to-end tests for complete user flows
- **Database Tests**: Example-based tests for query correctness

## Error Handling

### Controller-Level Error Handling

1. **Missing Wallet**: Gracefully handle with `firstOrCreate()`
   ```php
   $wallet = auth()->user()->wallet()->firstOrCreate(
       ['user_id' => auth()->id()],
       ['balance' => 0]
   );
   ```

2. **Invalid Filter Parameters**: Handled by `TransactionFilterRequest` validation
   - Invalid type: Returns 422 with validation error
   - Invalid date range: Returns 422 with validation error

3. **Pagination Errors**: Laravel automatically handles invalid page numbers
   - Page < 1: Defaults to page 1
   - Page > max: Returns empty results

### Frontend Error Handling

1. **Empty States**: 
   - No transactions: Display EmptyState component
   - No packages: Display EmptyState with appropriate message
   - No filter results: Display EmptyState with "Clear filters" action

2. **Loading States**:
   - Use Inertia's built-in loading indicators
   - Disable filter inputs during navigation

3. **Network Errors**:
   - Inertia automatically handles failed requests
   - Laravel's error pages displayed on 500 errors

### Edge Cases

1. **Zero Balance**: Display "0" prominently, not hide or show error
2. **Large Transaction Counts**: Pagination handles this automatically
3. **Future Dates in Filters**: Validation prevents date_to > today (not enforced, allowed for flexibility)
4. **Null/Missing Relationships**: 
   - Missing wallet: Created automatically
   - Missing order reference: Display transaction without order link

## Testing Strategy

### Unit Tests

**Controller Tests** (`tests/Feature/Client/WalletControllerTest.php`):

```php
class WalletControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_displays_wallet_balance_and_recent_transactions(): void
    {
        $user = User::factory()->client()->create();
        $wallet = Wallet::factory()->create(['user_id' => $user->id, 'balance' => 500]);
        WalletTransaction::factory()->count(7)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('client.wallet.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Client/Wallet/Index')
            ->has('wallet', fn ($wallet) => $wallet
                ->where('id', $wallet->id)
                ->where('balance', 500)
            )
            ->has('recentTransactions', 5) // Only last 5
        );
    }

    public function test_index_creates_wallet_if_not_exists(): void
    {
        $user = User::factory()->client()->create();
        
        $response = $this->actingAs($user)->get(route('client.wallet.index'));

        $response->assertOk();
        $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'balance' => 0]);
    }

    public function test_transactions_applies_type_filter(): void
    {
        $user = User::factory()->client()->create();
        WalletTransaction::factory()->create(['user_id' => $user->id, 'type' => 'credit_purchase']);
        WalletTransaction::factory()->create(['user_id' => $user->id, 'type' => 'order_payment']);

        $response = $this->actingAs($user)
            ->get(route('client.transactions.index', ['type' => 'credit_purchase']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.type', 'credit_purchase')
        );
    }

    public function test_transactions_applies_date_range_filter(): void
    {
        $user = User::factory()->client()->create();
        $oldTx = WalletTransaction::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(10),
        ]);
        $newTx = WalletTransaction::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($user)->get(route('client.transactions.index', [
            'date_from' => now()->subDays(5)->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $newTx->id)
        );
    }

    public function test_transactions_validates_filter_parameters(): void
    {
        $user = User::factory()->client()->create();

        $response = $this->actingAs($user)
            ->get(route('client.transactions.index', ['type' => 'invalid_type']));

        $response->assertSessionHasErrors('type');
    }

    public function test_topup_displays_active_credit_packages(): void
    {
        $user = User::factory()->client()->create();
        $activePackage = CreditPackage::factory()->create(['is_active' => true]);
        $inactivePackage = CreditPackage::factory()->create(['is_active' => false]);

        $response = $this->actingAs($user)->get(route('client.wallet.topup'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Client/Wallet/Topup')
            ->has('packages', 1)
            ->where('packages.0.id', $activePackage->id)
        );
    }

    public function test_wallet_routes_require_authentication(): void
    {
        $this->get(route('client.wallet.index'))->assertRedirect(route('login'));
        $this->get(route('client.transactions.index'))->assertRedirect(route('login'));
        $this->get(route('client.wallet.topup'))->assertRedirect(route('login'));
    }

    public function test_wallet_routes_require_client_role(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('client.wallet.index'))
            ->assertForbidden();
    }
}
```

**Enum Tests** (`tests/Unit/Enums/TransactionTypeTest.php`):

```php
class TransactionTypeTest extends TestCase
{
    public function test_enum_has_correct_values(): void
    {
        $this->assertEquals('credit_purchase', TransactionType::CreditPurchase->value);
        $this->assertEquals('order_payment', TransactionType::OrderPayment->value);
        $this->assertEquals('order_refund', TransactionType::OrderRefund->value);
        $this->assertEquals('revision_charge', TransactionType::RevisionCharge->value);
    }

    public function test_enum_provides_labels(): void
    {
        $this->assertEquals('Credit Purchase', TransactionType::CreditPurchase->label());
        $this->assertEquals('Order Payment', TransactionType::OrderPayment->label());
        $this->assertEquals('Order Refund', TransactionType::OrderRefund->label());
        $this->assertEquals('Revision Charge', TransactionType::RevisionCharge->label());
    }

    public function test_enum_provides_colors(): void
    {
        $this->assertEquals('blue', TransactionType::CreditPurchase->color());
        $this->assertEquals('orange', TransactionType::OrderPayment->color());
        $this->assertEquals('green', TransactionType::OrderRefund->color());
        $this->assertEquals('red', TransactionType::RevisionCharge->color());
    }
}
```

### Integration Tests

**Full Feature Tests** (`tests/Feature/Client/WalletFeatureTest.php`):

```php
class WalletFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_view_wallet_and_navigate_to_transactions(): void
    {
        $user = User::factory()->client()->create();
        Wallet::factory()->create(['user_id' => $user->id, 'balance' => 1000]);
        WalletTransaction::factory()->count(10)->create(['user_id' => $user->id]);

        // View wallet index
        $response = $this->actingAs($user)->get(route('client.wallet.index'));
        $response->assertOk();
        $response->assertSee('1000'); // Balance displayed
        $response->assertSee('Recent Transactions');

        // Navigate to full transactions
        $response = $this->actingAs($user)->get(route('client.transactions.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Client/Transactions/Index')
            ->has('transactions.data', 10)
        );
    }

    public function test_client_can_filter_transactions_by_multiple_criteria(): void
    {
        $user = User::factory()->client()->create();
        
        WalletTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'credit_purchase',
            'created_at' => now()->subDays(3),
        ]);
        
        WalletTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'order_payment',
            'created_at' => now()->subDays(1),
        ]);

        $response = $this->actingAs($user)->get(route('client.transactions.index', [
            'type' => 'credit_purchase',
            'date_from' => now()->subDays(5)->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.type', 'credit_purchase')
        );
    }
}
```

### Component Tests (React)

**Wallet Index Component** (`resources/js/Pages/Client/Wallet/__tests__/Index.test.jsx`):

```javascript
import { render, screen } from '@testing-library/react';
import Index from '../Index';

describe('Wallet Index Page', () => {
    it('displays wallet balance', () => {
        const props = {
            wallet: { id: 1, balance: 1500 },
            recentTransactions: [],
        };

        render(<Index {...props} />);

        expect(screen.getByText(/1,500/)).toBeInTheDocument();
        expect(screen.getByText(/Available Credits/i)).toBeInTheDocument();
    });

    it('displays recent transactions', () => {
        const props = {
            wallet: { id: 1, balance: 1000 },
            recentTransactions: [
                { id: 1, type: 'credit_purchase', credits: 500, description: 'Purchase', created_at: '2024-01-01' },
                { id: 2, type: 'order_payment', credits: -100, description: 'Order #123', created_at: '2024-01-02' },
            ],
        };

        render(<Index {...props} />);

        expect(screen.getByText(/Purchase/)).toBeInTheDocument();
        expect(screen.getByText(/Order #123/)).toBeInTheDocument();
    });

    it('displays empty state when no transactions', () => {
        const props = {
            wallet: { id: 1, balance: 0 },
            recentTransactions: [],
        };

        render(<Index {...props} />);

        expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
    });
});
```

### Test Coverage Goals

- **Controllers**: 100% line coverage (simple pass-through logic)
- **Form Requests**: 100% validation rule coverage
- **Enums**: 100% method coverage
- **React Components**: 80%+ coverage focusing on user interactions
- **Integration Tests**: Cover all happy paths and major error scenarios

### Testing Execution

```bash
# Backend tests
php artisan test --filter=WalletController
php artisan test --filter=TransactionType

# Frontend tests (once React testing is set up)
npm run test -- Wallet

# Full suite
php artisan test
npm run test
```

### Manual Testing Checklist

- [ ] Wallet index displays correct balance for user with transactions
- [ ] Wallet index creates wallet if none exists (balance shows 0)
- [ ] Recent transactions limited to 5 and sorted newest first
- [ ] Transaction types display correct colored badges
- [ ] Credit additions shown in green, deductions in red
- [ ] Transaction history pagination works correctly
- [ ] Type filter returns only matching transactions
- [ ] Date range filter works correctly
- [ ] Multiple filters can be combined
- [ ] Empty state displays when no transactions match filters
- [ ] Top-up page shows only active credit packages
- [ ] "View All Transactions" link navigates correctly
- [ ] "Top Up" button navigates correctly
- [ ] Breadcrumbs display correctly on all pages
- [ ] Mobile responsive layout works for all pages
- [ ] Non-client users cannot access wallet routes

