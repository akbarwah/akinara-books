-- Dummy Data for Customers
INSERT INTO public.customers (id, phone_number, full_name, created_at) VALUES 
('11111111-1111-1111-1111-111111111111', '081234567890', 'Budi Santoso', NOW() - INTERVAL '10 days'),
('22222222-2222-2222-2222-222222222222', '089876543210', 'Siti Aminah', NOW() - INTERVAL '8 days'),
('33333333-3333-3333-3333-333333333333', '085612341234', 'Andi Pratama', NOW() - INTERVAL '5 days'),
('44444444-4444-4444-4444-444444444444', '081122334455', 'Nia Ramadhani', NOW() - INTERVAL '2 days'),
('55555555-5555-5555-5555-555555555555', '082233445566', 'Rio Dewanto', NOW() - INTERVAL '1 days');

-- Dummy Data for Orders
INSERT INTO public.orders (id, customer_id, total_amount, deposit_amount, outstanding_amount, payment_status, notes, created_at) VALUES 
('AKN-260405-ABCD', '11111111-1111-1111-1111-111111111111', 350000, 350000, 0, 'Lunas', 'Pesanan lunas dari Budi', NOW() - INTERVAL '10 days'),
('AKN-260407-WXYZ', '22222222-2222-2222-2222-222222222222', 450000, 200000, 250000, 'DP', 'DP dulu', NOW() - INTERVAL '8 days'),
('AKN-260410-EFGH', '33333333-3333-3333-3333-333333333333', 150000, 150000, 0, 'Lunas', 'COD Cash lunas', NOW() - INTERVAL '5 days'),
('AKN-260413-IJKL', '44444444-4444-4444-4444-444444444444', 600000, 300000, 300000, 'DP', 'Cicilan DP ke-1', NOW() - INTERVAL '2 days'),
('AKN-260414-MNOP', '55555555-5555-5555-5555-555555555555', 850000, 100000, 750000, 'DP', 'Baru masuk 100rb', NOW() - INTERVAL '1 days');

-- Dummy Data for Order Items
INSERT INTO public.order_items (order_id, book_title, format, qty, price) VALUES 
('AKN-260405-ABCD', 'Peek a Boo, Where are You?', 'Board Book', 1, 150000),
('AKN-260405-ABCD', 'Very Hungry Caterpillar', 'Board Book', 1, 200000),

('AKN-260407-WXYZ', 'First 100 Words', 'Board Book', 2, 100000),
('AKN-260407-WXYZ', 'Harry Potter and the Sorcerers Stone', 'Hardback', 1, 250000),

('AKN-260410-EFGH', 'Peter Rabbit', 'Paperback', 1, 150000),

('AKN-260413-IJKL', 'Where is Spot?', 'Lift-the-Flap', 2, 150000),
('AKN-260413-IJKL', 'Goodnight Moon', 'Board Book', 1, 300000),

('AKN-260414-MNOP', 'The Gruffalo', 'Paperback', 3, 150000),
('AKN-260414-MNOP', 'Dear Zoo', 'Lift-the-Flap', 2, 200000);
