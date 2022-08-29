INSERT INTO department (name)
VALUES ('Sales');

INSERT INTO department (name)
VALUES ('Administration');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 50000.00, 1);

INSERT INTO role (title, salary, department_id)
VALUES ('Manager', 70000.00, 2);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ('Bob', 'Smith', 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Ann', 'Rogers', 1, 1);