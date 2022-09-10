const inquirer = require("inquirer");
const mysql = require("mysql2");
const db = require("./db/connection");
const cTable = require("console.table");
// const { title } = require("process");

var nextQuestion = [
  {
    type: "list",
    name: "option",
    message: "What would you like to do?",
    choices: [
      "view all departments",
      "view all roles",
      "view all employees",
      "add a department",
      "add a role",
      "add an employee",
      "update an employee role",
    ],
  },
];

function viewDepartments() {
  const queryString = `SELECT * FROM department;`;
  db.query(queryString, (err, result, fields) => {
    if (err) {
      console.log(err);
      return;
    }
    console.table(result);
    askNextQuestion();
  });
}

function viewRoles() {
  const queryString = `SELECT role.id, role.title, role.salary, department.name AS department 
    FROM role
    INNER JOIN department ON role.department_id = department.id;`;
  db.query(queryString, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.table(result);
    askNextQuestion();
  });
}

// This is working but creating duplicates
function viewEmployees() {
  const queryString = `SELECT e1.id, e1.first_name, e1.last_name, e2.first_name AS manager, role.title, department.name AS department 
  FROM employee e1
  JOIN employee e2
  ON e1.manager_id = e2.id
  JOIN role ON e1.role_id = role.id
  JOIN department ON role.department_id = department_id;`;
  // const queryString = "SELECT * FROM employee";
  db.query(queryString, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.table(result);
    askNextQuestion();
  });
}

function addDepartment(dept) {
  const queryString = `INSERT INTO department (name) 
    VALUES ('${dept.name}');`;
  db.query(queryString, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    askNextQuestion();
  });
}

function promptAddDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      },
    ])
    .then((answers) => {
      addDepartment(answers);
    });
}

function promptAddRole() {
  const queryString = `SELECT * FROM department;`;
  db.query(queryString, (err, result, fields) => {
    if (err) {
      console.log(err);
      return;
    }
    var departmentChoices = result.map((dept) => `${dept.id} - ${dept.name}`);
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary?",
        },
        {
          type: "list",
          name: "department",
          message: "What is the department?",
          choices: departmentChoices,
        },
      ])
      .then((answers) => {
        const departmentID = parseInt(answers.department.split(" - ")[0]);
        addRole({
          title: answers.title,
          salary: parseInt(answers.salary),
          department_id: departmentID,
        });
      });
  });
}

function addRole(role) {
  const queryString = `INSERT INTO role (title, salary, department_id) 
    VALUES ('${role.title}', ${role.salary.toFixed(2)}, ${
    role.department_id
  });`;
  db.query(queryString, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    askNextQuestion();
  });
}

function addEmployee(employee) {
  const employeeString = `INSERT INTO employee  (first_name, last_name, manager_id, role_id)
  VALUES ('${employee.first_name}', '${employee.last_name}', ${employee.manager_id}, ${employee.role_id});`;
  db.query(employeeString, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    askNextQuestion();
  });
}

function promptAddEmployee() {
  const roleQuery = `SELECT * FROM role;`;
  db.query(roleQuery, (err, roles) => {
    if (err) {
      console.log(err);
      return;
    }
    const managerQuery = `SELECT * FROM employee WHERE manager_id IS NULL;`;
    db.query(managerQuery, (managererr, manager) => {
      if (managererr) {
        console.log(managererr);
        return;
      }
      var managerChoices = manager.map(
        (employee) =>
          `${employee.id} - ${employee.first_name} ${employee.last_name}`
      );
      var roleChoices = roles.map((role) => `${role.id} - ${role.title}`);
      inquirer
        .prompt([
          {
            type: "input",
            name: "first_name",
            message: "What is the employees first name?",
          },
          {
            type: "input",
            name: "last_name",
            message: "What is the employees last name?",
          },
          {
            type: "list",
            name: "manager",
            message: "Who is the manager?",
            choices: managerChoices,
          },
          {
            type: "list",
            name: "role",
            message: "What is the employees role?",
            choices: roleChoices,
          },
        ])
        .then((answers) => {
          const managerId = parseInt(answers.manager.split(" - ")[0]);
          const roleId = parseInt(answers.role.split(" - ")[0]);
          addEmployee({
            first_name: answers.first_name,
            last_name: answers.last_name,
            role_id: roleId,
            manager_id: managerId,
          });
        });
    });
  });
}

function askNextQuestion() {
  inquirer.prompt(nextQuestion).then((answers) => {
    switch (answers.option) {
      case "view all departments":
        viewDepartments();
        break;
      case "view all roles":
        viewRoles();
        break;
      case "view all employees":
        viewEmployees();
        break;
      case "add a department":
        promptAddDepartment();
        break;
      case "add a role":
        promptAddRole();
        break;
      case "add an employee":
        promptAddEmployee();
        break;
      case "update an employee role":
        // updateRole()
        // provide a list of employees
        // what new role are they being updated to
        // inquirer prompt
        break;
      default:
        return;
    }
  });
}

askNextQuestion();
