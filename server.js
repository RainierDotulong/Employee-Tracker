const mysql = require('mysql2')
// import inquirer
const inquirer = require('inquirer')

const cTable = require('console.table')

const connection = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: 'password',
	database: 'employee_db',
})

// connection ID
connection.connect(function (err) {
	if (err) throw err
	console.log('Connected')
	start()
})

function start() {
	inquirer
		.prompt([
			{
				type: 'list',
				message: 'What would you like to do?',
				name: 'choice',
				choices: [
					'View All Employees?',
					'View All Roles?',
					'View all Departments',
					'Update Employee',
					'Add Employee?',
					'Add Role?',
					'Add Department?',
				],
			},
		])
		.then(function (res) {
			switch (res.choice) {
				case 'View All Employees?':
					viewAllEmployees()
					break

				case 'View All Roles?':
					viewAllRoles()
					break
				case 'View all Departments':
					viewAllDepartments()
					break

				case 'Add Employee?':
					addEmployee()
					break

				case 'Update Employee':
					updateEmployee()
					break

				case 'Add Role?':
					addRole()
					break

				case 'Add Department?':
					addDepartment()
					break
			}
		})
}
//DONE
function viewAllEmployees() {
	const sql = `SELECT employee.id, 
                employee.first_name, 
                employee.last_name, 
                role.title, 
                department.name AS department,
                role.salary, 
                CONCAT (manager.first_name, " ", manager.last_name) AS Manager
        FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id`

	connection.query(sql, function (err, res) {
		if (err) throw err
		console.table(res)
		start()
	})
}

function viewAllRoles() {
	const sql = `SELECT role.id AS id, role.title AS Role FROM role`
	connection.query(sql, function (err, res) {
		if (err) throw err
		console.table(res)
		start()
	})
}

function viewAllDepartments() {
	const sql = `SELECT department.id AS id, department.name AS Department FROM department`
	connection.query(sql, function (err, res) {
		if (err) throw err
		console.table(res)
		start()
	})
}
function addEmployee() {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'firstName',
				message: "What is the employee's first name?",
				validate: (addFirstName) => {
					if (addFirstName) {
						return true
					} else {
						console.log('Please Enter the first name')
						return false
					}
				},
			},
			{
				type: 'input',
				name: 'lastName',
				message: "What is the employee's last name?",
				validate: (addLastName) => {
					if (addLastName) {
						return true
					} else {
						console.log('Please Enter the last name')
						return false
					}
				},
			},
		])
		.then((res) => {
			const params = [res.firstName, res.lastName]

			const roleSql = `SELECT role.id, role.title FROM role`

			connection.query(roleSql, function (err, data) {
				if (err) throw err
				const roles = data.map(({ id, title }) => ({ name: title, value: id }))

				inquirer
					.prompt([
						{
							type: 'list',
							name: 'role',
							message: "what s the employee's role?",
							choices: roles,
						},
					])
					.then((chosenRole) => {
						const role = chosenRole.role
						params.push(role)
						const managerSql = `SELECT * FROM employee`

						connection.query(managerSql, function (err, data) {
							if (err) throw err
							const managers = data.map(({ id, first_name, last_name }) => ({
								name: first_name + ' ' + last_name,
								value: id,
							}))

							inquirer
								.prompt([
									{
										type: 'list',
										name: 'manager',
										message: "Who is the employee's manager?",
										choices: managers,
									},
								])
								.then((chosenManager) => {
									const manager = chosenManager.manager
									params.push(manager)

									const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)`
									connection.query(sql, params, function (err, res) {
										if (err) throw err
										console.log('Employee ADDED to database')
										viewAllEmployees()
									})
								})
						})
					})
			})
		})
}
//FIX THIS -------
function updateEmployee() {
	const employeeSql = `SELECT * FROM employee`

	connection.query(employeeSql, (err, data) => {
		if (err) throw err
		const employees = data.map(({ id, first_name, last_name }) => ({
			name: first_name + ' ' + last_name,
			value: id,
		}))
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'name',
					message: 'Choose employee to update',
					choices: employees,
				},
			])
			.then((employeeChosen) => {
				const employee = employeeChosen.name
				const param = []
				param.push(employee)

				const roleSql = `SELECT * FROM role`

				connection.query(roleSql, (err, data) => {
					if (err) throw err
					const roles = data.map(({ id, title }) => ({
						name: title,
						value: id,
					}))
					inquirer
						.prompt([
							{
								type: 'list',
								name: 'name',
								message: 'Choose new role',
								choices: roles,
							},
						])
						.then((chosenRole) => {
							const role = chosenRole.role
							param.push(role)

							let employee = param[0]
							param[0] = role
							param[1] = employee

							const sql = `UPDATE employee SET role_id = ? WHERE id = ?`

							connection.query(sql, param, (err, res) => {
								if (err) throw err
								console.log('Employee updated')
								viewAllEmployees()
							})
						})
				})
			})
	})
}
// ---------------
function addRole() {
	connection.query(
		'SELECT role.title AS Title, role.salary AS Salary FROM role',
		function (err, res) {
			inquirer
				.prompt([
					{
						type: 'input',
						name: 'role',
						message: "What is the employee's role",
						validate: (addSalary) => {
							if (addSalary) {
								return true
							} else {
								console.log('Please Enter the Role')
								return false
							}
						},
					},
					{
						type: 'input',
						name: 'salary',
						message: "What is the employee's salary",
						validate: (addSalary) => {
							if (addSalary) {
								return true
							} else {
								console.log('Please Enter the Salary')
								return false
							}
						},
					},
				])
				.then((res) => {
					const params = [res.role, res.salary]
					const roleSql = `SELECT name, id FROM department`

					connection.query(roleSql, (err, data) => {
						if (err) throw err
						const department = data.map(({ name, id }) => ({
							name: name,
							value: id,
						}))

						inquirer
							.prompt([
								{
									type: 'list',
									name: 'department',
									message: 'What department is the role in?',
									choices: department,
								},
							])
							.then((departmentChosen) => {
								const department = departmentChosen.department
								params.push(department)

								const sql = `INSERT INTO role (title, salary, department_id) VALUES(?,?,?)`

								connection.query(sql, params, (err, data) => {
									if (err) throw err
									console.log('added role')
									viewAllRoles()
								})
							})
					})
				})
		}
	)
}

function addDepartment() {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'addDepartment',
				message: 'What department name to add?',
				validate: (addDepartment) => {
					if (addDepartment) {
						return true
					} else {
						console.log('Enter department name')
						return false
					}
				},
			},
		])
		.then((res) => {
			const sql = `INSERT INTO department (name) VALUES(?)`
			connection.query(sql, res.addDepartment, (err, data) => {
				console.log('added Department')
				viewAllDepartments()
			})
		})
}
