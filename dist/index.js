import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';
await connectToDb();
const selectionMenu = [
    'view all departments', //0
    'view all roles', //1
    'view all employees', //2
    'add a department', //3
    'add a role', //4
    'add an employee', //5
    'update employee role', //6
    'Exit' //7
];
const dbQuery = [
    `Select * from department`, //0
    `SELECT  
        r.title AS job_title,
        r.id AS role_id,
        d.name AS department_name,
        r.salary
    FROM role r
    JOIN department d ON r.department = d.id;
    `, //2
    `SELECT 
        e.id,
        e.first_name,
        e.last_name,
        r.title AS job_title,
        d.name AS department_name,
        r.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
    `, //3
    `INSERT INTO role (title, salary, department) VALUES ($1, $2, $3) RETURNING *;` //4
];
async function init() {
    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Welcome, what would you like to do?',
            choices: selectionMenu
        }
    ]);
    switch (choice) {
        case selectionMenu[0]:
            viewDepartments();
            break;
        case selectionMenu[1]:
            viewRoles();
            break;
        case selectionMenu[2]:
            viewEmployees();
            break;
        case selectionMenu[3]:
            addDepartment();
            break;
        case selectionMenu[4]:
            addRole();
            break;
        case selectionMenu[5]:
            addEmployee();
            break;
        case selectionMenu[6]:
            updateEmployee();
            break;
        case selectionMenu[7]:
            console.log(`See you next time!`);
            break;
    }
}
function viewDepartments() {
    const query = dbQuery[0];
    pool.query(query, (err, result) => {
        if (err)
            throw err;
        console.table(result.rows);
        init();
    });
}
;
function viewRoles() {
    const query = dbQuery[1];
    pool.query(query, (err, result) => {
        if (err)
            throw err;
        console.table(result.rows);
        init();
    });
}
function viewEmployees() {
    const query = dbQuery[2];
    pool.query(query, (err, result) => {
        if (err)
            throw err;
        console.table(result.rows);
        init();
    });
}
const addDepartment = async () => {
    const { departmentName } = await inquirer.prompt([
        {
            name: 'departmentName',
            type: 'input',
            message: 'Insert new Department Name',
            validate: (input) => input ? true : 'El nombre no puede estar vacío.',
        }
    ]);
    try {
        const query = `INSERT INTO department (name) VALUES ($1) RETURNING *;`;
        const values = [departmentName];
        const { rows } = await pool.query(query, values);
        console.log(`✅ Departamento añadido: ${rows[0].name}`);
    }
    catch (error) {
        console.error("❌ Error al añadir departamento:", error);
    }
    init();
};
//add employee funct
const getRoles = async () => {
    try {
        const { rows } = await pool.query(`SELECT id, title FROM role`);
        return rows;
    }
    catch (error) {
        console.error("❌ Error al obtener roles:", error);
        return [];
    }
};
// Obtener todos los empleados para seleccionar un manager opcional
const getEmployees = async () => {
    try {
        const { rows } = await pool.query(`SELECT id, first_name, last_name FROM employee`);
        return rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, id: emp.id }));
    }
    catch (error) {
        console.error("❌ Error al obtener empleados:", error);
        return [];
    }
};
// Función para añadir un nuevo empleado
const addEmployee = async () => {
    const { firstName, lastName } = await inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: 'Enter employee first name:',
            validate: (input) => input ? true : 'First name cannot be empty.'
        },
        {
            name: 'lastName',
            type: 'input',
            message: 'Enter employee last name:',
            validate: (input) => input ? true : 'Last name cannot be empty.'
        }
    ]);
    // Obtener los roles disponibles
    const roles = await getRoles();
    if (roles.length === 0) {
        console.log('❌ No roles available. Create one before adding employees.');
        return;
    }
    // Preguntar al usuario qué rol asignar al empleado
    const { roleId } = await inquirer.prompt([
        {
            name: 'roleId',
            type: 'list',
            message: 'Select a role for the employee:',
            choices: roles.map(role => ({ name: role.title, value: role.id })),
        }
    ]);
    // Obtener los empleados disponibles para elegir un manager
    const employees = await getEmployees();
    const { managerId } = await inquirer.prompt([
        {
            name: 'managerId',
            type: 'list',
            message: 'Select a manager (or choose "None" if no manager is assigned):',
            choices: [
                ...employees.map(emp => ({ name: emp.name, value: emp.id }))
            ],
        }
    ]);
    try {
        const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
        const values = [firstName, lastName, roleId, managerId];
        const { rows } = await pool.query(query, values);
        console.log(`✅ Employee added: ${rows[0].first_name} ${rows[0].last_name} with role ID ${roleId} and manager ID ${managerId || 'None'}`);
    }
    catch (error) {
        console.error(`❌ Error adding employee: `, error);
    }
    init();
};
//add roll funct
const addRole = async () => {
    const getDepartments = async () => {
        try {
            const { rows } = await pool.query(`SELECT id, name FROM department`);
            return rows;
        }
        catch (error) {
            console.error("❌ Error al obtener departamentos:", error);
            return [];
        }
    };
    const { roleName, salary } = await inquirer.prompt([
        {
            name: 'roleName',
            type: 'input',
            message: 'Insert the new role name',
            validate: (input) => input ? true : 'New role name is not valid'
        },
        {
            name: 'salary',
            type: 'input',
            message: 'Insert Salary for this new rol.',
            validate: (input) => isNaN(Number(input)) ? 'Debe ser un número válido.' : true,
        }
    ]);
    const departments = await getDepartments();
    if (departments.length === 0) {
        console.log('No departments availaable. Create one to display.');
        return;
    }
    const { departmentId } = await inquirer.prompt([
        {
            name: 'departmentId',
            type: 'list',
            message: 'Select a department to realate for the new rol.',
            choices: departments.map(dept => ({ name: dept.name, value: dept.id })),
        }
    ]);
    try {
        const query = `INSERT INTO role (title, salary, department) VALUES ($1, $2, $3) RETURNING *;`;
        const values = [roleName, salary, departmentId];
        const { rows } = await pool.query(query, values);
        console.log(`Roll added! ${rows[0].title} in the department ${departmentId} with the salary ${salary}`);
        init();
    }
    catch (error) {
        console.error(`Err adding rol: ` + error);
    }
};
//update employee
const updateEmployee = async () => {
    // Obtener lista de empleados
    const employees = await getEmployees();
    if (employees.length === 0) {
        console.log('❌ No employees available.');
        return;
    }
    // Seleccionar empleado a actualizar
    const { employeeId } = await inquirer.prompt([
        {
            name: 'employeeId',
            type: 'list',
            message: 'Select the employee to update:',
            choices: employees.map(emp => ({ name: emp.name, value: emp.id })),
        }
    ]);
    // Preguntar qué quiere actualizar
    const { updateChoice } = await inquirer.prompt([
        {
            name: 'updateChoice',
            type: 'list',
            message: 'What do you want to update?',
            choices: ['Role', 'Manager', 'Cancel'],
        }
    ]);
    if (updateChoice === 'Cancel') {
        console.log('❌ Update cancelled.');
        return;
    }
    let query = '';
    let values = [];
    if (updateChoice === 'Role') {
        // Obtener roles disponibles
        const roles = await getRoles();
        if (roles.length === 0) {
            console.log('❌ No roles available.');
            return;
        }
        // Seleccionar nuevo rol
        const { newRoleId } = await inquirer.prompt([
            {
                name: 'newRoleId',
                type: 'list',
                message: 'Select a new role:',
                choices: roles.map(role => ({ name: role.title, value: role.id })),
            }
        ]);
        query = `UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *;`;
        values = [newRoleId, employeeId];
    }
    else if (updateChoice === 'Manager') {
        // Obtener lista de managers disponibles
        const managers = await getEmployees();
        const { newManagerId } = await inquirer.prompt([
            {
                name: 'newManagerId',
                type: 'list',
                message: 'Select a new manager (or choose "None" to remove manager):',
                choices: [
                    { name: 'None', value: null },
                    ...managers.map(m => ({ name: m.name, value: m.id })),
                ],
            }
        ]);
        query = `UPDATE employee SET manager_id = $1 WHERE id = $2 RETURNING *;`;
        values = [newManagerId, employeeId];
    }
    // Ejecutar la actualización en la DB
    try {
        const { rows } = await pool.query(query, values);
        console.log(`✅ Employee updated: ${rows[0].first_name} ${rows[0].last_name}`);
    }
    catch (error) {
        console.error(`❌ Error updating employee: `, error);
    }
};
init();
