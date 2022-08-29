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
        // viewEmployees()
        break;
      case "add a department":
        promptAddDepartment();
        break;
      case "add a role":
        promptAddRole();
        break;
      case "add an employee":
        // addEmployee()
        break;
      case "update an employee role":
        // updateRole()
        break;
      default:
        return;
    }
  });
}

askNextQuestion();
