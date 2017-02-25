(function () {

    var StudentModel = function (name, attendance) {
        this._name = name;
        if (attendance === undefined || attendance.constructor !== Array) {
            this._attendace = [];
        }
        else {
            this._attendace = attendance
        }
    }
    StudentModel.prototype.toggleAttendance = function (key) {
        this._attendace[key] = !this._attendace[key];
    };
    StudentModel.prototype.checkAttendance = function (key) {
        this._attendace[key] = true;
    };
    StudentModel.prototype.clearAttendance = function (key) {
        this._attendace[key] = false;
    };


    var TableView = {
        init: function () {
            this.nameHeader = $('th.name-col');
            this.missedColHeader = $('th.missed-col');
            this.tableBody = $('tbody');
            this.render();
        },

        render: function () {
            var HTMLHeaders = '';
            var HTMLTableDataCheckbox = '<td class="attend-col"><input type="checkbox" data-attendance-day="{{i}}" {{checked}}></td>';
            for (var i = 0; i < Controller.totalDays; i++) {
                HTMLHeaders += '<th>' + (i + 1) + '</th>';
            }
            this.nameHeader.after(HTMLHeaders);

            Controller.studentsArray.forEach(function (student) {
                var HTMLTableData = '';
                var HTMLTableRow = '';
                var HTMLTemplateData = '';
                for (var i = 0; i < Controller.totalDays; i++) {
                    HTMLTemplateData = HTMLTableDataCheckbox.replace('{{i}}', i);
                    if (student._attendace[i]) {
                        HTMLTemplateData = HTMLTemplateData.replace('{{checked}}', 'checked');
                    }
                    else {
                        HTMLTemplateData = HTMLTemplateData.replace('{{checked}}', '');
                    }
                    HTMLTableData += HTMLTemplateData;
                }
                HTMLTableData += '<td class="missed-col">' + Controller.countMissing(student) + '</td>';
                HTMLTableRow = '<tr class="student"><td class="name-col">{{name}}</td>' + HTMLTableData + '</tr>';
                this.tableBody.append(HTMLTableRow.replace('{{name}}', student._name));
            }, this);

            $('table').removeClass('hide-element');

            $(':checkbox').click(function (event) {
                var elem = $(event.currentTarget);
                var parent = elem.parent().parent();
                var name = parent.children('.name-col').text();
                var day = elem.attr('data-attendance-day');
                var student = Controller.getStudentByName(name);
                Controller.toggleAttendance(student, day);
                parent.children('.missed-col').text(Controller.countMissing(student));
            });
        }
    }

    var Controller = {
        init: function () {
            this.totalDays = 12;
            this.initLocalStorage();
            this.studentsArray = this.getStudentsFromJSON();
            TableView.init();
        },
        initLocalStorage: function () {
            if (!localStorage.students) {
                console.log('Creating student records...');
                function getRandom() {
                    return (Math.random() >= 0.5);
                }
                var studentNames = ['Slappy the Frog', 'Lilly the Lizard', 'Paulrus the Walrus', 'Gregory the Goat', 'Adam the Anaconda'];
                var students = [];

                studentNames.forEach(function (name) {

                    var student = new StudentModel(name);

                    for (var i = 0; i < this.totalDays; i++) {
                        student._attendace.push(getRandom());
                    }
                    students.push(student);
                }, this);
                localStorage.students = JSON.stringify(students);
            }
        },
        getStudentsFromJSON: function () {
            var studentsArray = [];
            JSON.parse(localStorage.students).forEach(function (studentJSON) {
                studentsArray.push(new StudentModel(studentJSON._name, studentJSON._attendace));
            });
            return studentsArray;
        },
        countMissing: function (student) {
            return student._attendace.filter(function (val) {
                return !val;
            }).length;
        },
        getStudentByName: function (name) {
            return this.studentsArray.find(function (student) {
                return student._name === name;
            });
        },
        toggleAttendance: function (student, day) {
            student._attendace[day] = !student._attendace[day];
            localStorage.students = JSON.stringify(this.studentsArray);
        }
    }

    Controller.init();
})();