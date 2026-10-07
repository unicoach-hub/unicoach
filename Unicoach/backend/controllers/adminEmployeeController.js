const Employee = require('../models/Employee');

const seedDefaultEmployees = async () => {
  const count = await Employee.countDocuments();
  if (count === 0) {
    await Employee.insertMany([
      {
        name: 'Sagar Sharma',
        email: 'sagar.counselor@unicoach.com',
        phone: '+91 9518657944',
        role: 'Senior Study Abroad Counselor',
        specialization: 'USA & UK Admissions Specialist',
        branch: 'Panipat Head Office',
        status: 'active'
      },
      {
        name: 'Priya Patel',
        email: 'priya.counselor@unicoach.com',
        phone: '+91 9876543210',
        role: 'Visa & Scholarship Advisor',
        specialization: 'Germany & Canada Specialist',
        branch: 'Panipat Head Office',
        status: 'active'
      }
    ]);
  }
};

/**
 * GET /api/admin/employees
 * GET all employees
 */
exports.getAllEmployees = async (req, res) => {
  try {
    await seedDefaultEmployees();
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    return res.status(500).json({ error: 'Server error fetching employees' });
  }
};

/**
 * POST /api/admin/employees
 * Add new employee
 */
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, role, specialization, branch, status } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and Phone number are required' });
    }

    const employee = new Employee({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@unicoach.com`,
      phone,
      role: role || 'Counselor',
      specialization: specialization || 'Study Abroad Specialist',
      branch: branch || 'Panipat Head Office',
      status: status || 'active'
    });

    await employee.save();
    return res.status(201).json(employee);
  } catch (err) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ error: 'Failed to add employee' });
  }
};

/**
 * PUT /api/admin/employees/:id
 * Update employee
 */
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    return res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
};

/**
 * DELETE /api/admin/employees/:id
 * Delete employee
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    return res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
};
