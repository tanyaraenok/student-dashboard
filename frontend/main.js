(() => {
  const studentName = document.getElementById('student-name');
  const studentSurname = document.getElementById('student-surname');
  const studentMiddleName = document.getElementById('student-middle-name');
  const studentBirthDateInput = document.getElementById('student-birth-date');
  const studyStartYearInput = document.getElementById('study-start-year');
  const emptyNameError = document.getElementById('empty-name-error');
  const emptySurnameError = document.getElementById('empty-surname-error');
  const emptyMiddlenameError = document.getElementById('empty-middlename-error');
  const emptybDayError = document.getElementById('empty-bday-error');
  const bDayError = document.getElementById('bday-error');
  const emptyStudyYearError = document.getElementById('empty-study-year-error');
  const studyYearError = document.getElementById('study-year-error');
  const emptyFacultyError = document.getElementById('empty-faculty-error');
  const errorList = document.getElementById('errors-list');
  const faculty = document.getElementById('faculty');
  const START_BDAY = new Date('1900-01-01');
  const START_STUDY_DATE = new Date('2000-01-01');
  const STUDY_DURATION = 4;
  const START_STUDY_MONTH = 8;
  const LOCALHOST_LINK = 'http://localhost:3000/api/students';

  //First Loading
  const studentsArray = [
    {
      name: 'Антон',
      surname: 'Шастун',
      lastname: 'Валерьевич',
      birthday: new Date('1991-05-12'),
      studyStart: 2005,
      faculty: 'Маркетинга'
    },

    {
      name: 'Пётр',
      surname: 'Петров',
      lastname: 'ИванОВИЧ',
      birthday: new Date('1989-12-25'),
      studyStart: 2022,
      faculty: 'Логистики'
    },

    {
      name: 'Денис',
      surname: 'Беляев',
      lastname: 'Валентинович',
      birthday: new Date('1989-05-17'),
      studyStart: 2023,
      faculty: 'Машиностроительный'
    },

    {
      name: 'Милана',
      surname: 'Петрова',
      lastname: 'Петровна',
      birthday: new Date('1988-06-01'),
      studyStart: 2011,
      faculty: 'Статистики'
    },

    {
      name: 'Арсений',
      surname: 'Маслаков',
      lastname: 'Игоревич',
      birthday: new Date('1997-09-19'),
      studyStart: 2015,
      faculty: 'Физкультурный'
    }

  ];

  let savedStudentsArray = [];

  async function saveStudentOnServer(studentObj) {

    const response = await fetch(LOCALHOST_LINK, {

      method: 'POST',

      body: JSON.stringify(studentObj),

      headers: {
        'Content-Type': 'application/json',
      }
    });

    return await response.json();
  }

  async function loadStudents() {
    const responseForLoadArrayFromServer = await fetch(LOCALHOST_LINK);
    return await responseForLoadArrayFromServer.json();
  }

  async function loadDefaultStudents() {
    for (const studentObj of studentsArray) {
      saveStudentOnServer(studentObj).then((student) => {
        savedStudentsArray.push(student);
        renderStudentsTable(savedStudentsArray);
      });
    }
  }

  loadStudents().then(students => {
    savedStudentsArray = students;
    if (savedStudentsArray.length) {
      renderStudentsTable(savedStudentsArray);
    }
    else {
      loadDefaultStudents();
    }
  });

  addSortListeners();
  addFilterListeners();

  //Form

  function getStudentItem(studentObj) {

    const studentRow = document.createElement('tr');
    studentRow.id = studentObj.id;

    const domStudentFullName = document.createElement('th');
    domStudentFullName.classList.add('tbody-th');
    domStudentFullName.innerText = studentObj.surname.replaceAll(' ', '').charAt(0).toUpperCase() + studentObj.surname.replaceAll(' ', '').substring(1).toLowerCase() + ' ' + studentObj.name.replaceAll(' ', '').charAt(0).toUpperCase() + studentObj.name.replaceAll(' ', '').substring(1).toLowerCase() + ' ' + studentObj.lastname.replaceAll(' ', '').charAt(0).toUpperCase() + studentObj.lastname.replaceAll(' ', '').substring(1).toLowerCase();

    const domFaculty = document.createElement('th');
    domFaculty.classList.add('tbody-th');
    domFaculty.innerText = studentObj.faculty.trim().charAt(0).toUpperCase() + studentObj.faculty.trim().substring(1).toLowerCase();

    const domBirthDay = document.createElement('th');
    domBirthDay.classList.add('tbody-th');

    const bDay = new Date(studentObj.birthday);
    let age = new Date().getFullYear() - bDay.getFullYear();

    if (new Date().getMonth() < bDay.getMonth() || (new Date().getMonth() === bDay.getMonth() && new Date().getDate() < bDay.getDate())) {
      age -= 1;
    }

    const textYear = {
      one: 'год',
      few: 'года',
      many: 'лет',
      other: 'года'
    }[(new Intl.PluralRules("ru-RU")).select(age)];

    domBirthDay.innerText = `${bDay.toLocaleDateString("ru-RU")} (${age} ${textYear})`;

    const domStartStudyYear = document.createElement('th');
    domStartStudyYear.classList.add('tbody-th');

    const endStudyYear = +(studentObj.studyStart) + STUDY_DURATION;

    const course = new Date().getFullYear() - +(studentObj.studyStart);

    let textCourse = `(${course} курс)`;

    if (course > STUDY_DURATION || (course === STUDY_DURATION && new Date().getMonth() > START_STUDY_MONTH)) {
      textCourse = `(закончил)`;
    }

    if (course < 1) {
      textCourse = `(ещё не поступил)`;
    }

    domStartStudyYear.innerText = `${+(studentObj.studyStart)}-${endStudyYear} ${textCourse}`;

    const deleteButtonTh = document.createElement('th');
    deleteButtonTh.classList.add('delete-button-th');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.ariaLabel = 'Удалить пользователя';
    deleteButtonTh.append(deleteButton);

    deleteButton.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить студента из списка?')) {
        savedStudentsArray.forEach((studentObj, index) => {
          if (studentRow.id == studentObj.id) {
            savedStudentsArray.splice(index, 1);
            fetch(`${LOCALHOST_LINK}/${studentObj.id}`, {
              method: 'DELETE',
            });
            renderStudentsTable(filter());
          }
        })
      };
    })

    studentRow.append(domStudentFullName, domFaculty, domBirthDay, domStartStudyYear, deleteButtonTh);
    studentRow.id = studentObj.id;

    return studentRow;
  }

  function renderStudentsTable(studentsArray) {
    document.getElementById('students-list').replaceChildren('');
    for (const studentObj of studentsArray) {
      document.getElementById('students-list').append(getStudentItem(studentObj));
    }
  }

  //validation

  function hideErrors() {
    emptyNameError.classList.add('hidden');
    emptySurnameError.classList.add('hidden');
    emptyMiddlenameError.classList.add('hidden');
    emptybDayError.classList.add('hidden');
    bDayError.classList.add('hidden');
    emptyStudyYearError.classList.add('hidden');
    studyYearError.classList.add('hidden');
    emptyFacultyError.classList.add('hidden');
    errorList.classList.add('hidden');
    studentName.classList.remove('error-input');
    studentSurname.classList.remove('error-input');
    studentMiddleName.classList.remove('error-input');
    studentBirthDateInput.classList.remove('error-input');
    studyStartYearInput.classList.remove('error-input');
    faculty.classList.remove('error-input');
  }

  function validateLength(input) {
    return Boolean(input.value.trim().length);
  }

  function validateBdate(input) {
    return new Date(input.value) <= new Date() && new Date(input.value) >= START_BDAY;
  }

  function validateStudyYear(input) {
    return new Date(input.value) <= new Date() && +input.value >= START_STUDY_DATE.getFullYear();
  }

  function validate() {

    hideErrors();

    let isValid = true;

    if (!validateLength(studentName)) {
      emptyNameError.classList.remove('hidden');
      studentName.classList.add('error-input');
      isValid = false;
    }

    if (!validateLength(studentSurname)) {
      emptySurnameError.classList.remove('hidden');
      studentSurname.classList.add('error-input');
      isValid = false;
    }

    if (!validateLength(studentMiddleName)) {
      emptyMiddlenameError.classList.remove('hidden');
      studentMiddleName.classList.add('error-input');
      isValid = false;
    }

    if (!validateLength(studentBirthDateInput)) {
      emptybDayError.classList.remove('hidden');
      studentBirthDateInput.classList.add('error-input');
      isValid = false;
    }

    if (!validateBdate(studentBirthDateInput)) {
      bDayError.classList.remove('hidden');
      studentBirthDateInput.classList.add('error-input');
      isValid = false;
    }

    if (!validateLength(studyStartYearInput)) {
      emptyStudyYearError.classList.remove('hidden');
      studyStartYearInput.classList.add('error-input');
      isValid = false;
    }

    if (!validateStudyYear(studyStartYearInput)) {
      studyYearError.classList.remove('hidden');
      studyStartYearInput.classList.add('error-input');
      isValid = false;
    }

    if (!validateLength(faculty)) {
      emptyFacultyError.classList.remove('hidden');
      faculty.classList.add('error-input');
      isValid = false;
    }

    if (!isValid) {
      errorList.classList.remove('hidden');
    }

    return isValid;
  }

  document.getElementById('data-form').addEventListener('submit', (event) => {

    event.preventDefault();

    if (!validate()) {
      return;
    }

    const studentNew = {
      name: studentName.value.replaceAll(' ', '').charAt(0).toUpperCase() + studentName.value.replaceAll(' ', '').substring(1).toLowerCase(),
      surname: studentSurname.value.replaceAll(' ', '').charAt(0).toUpperCase() + studentSurname.value.replaceAll(' ', '').substring(1).toLowerCase(),
      lastname: studentMiddleName.value.replaceAll(' ', '').charAt(0).toUpperCase() + studentMiddleName.value.replaceAll(' ', '').substring(1).toLowerCase(),
      birthday: new Date(studentBirthDateInput.value),
      studyStart: Number(studyStartYearInput.value),
      faculty: faculty.value.trim().charAt(0).toUpperCase() + faculty.value.trim().substring(1).toLowerCase(),
    }

    for (const student of savedStudentsArray) {
      const studentForCheck = {
        name: student.name.replaceAll(' ', '').charAt(0).toUpperCase() + student.name.replaceAll(' ', '').substring(1).toLowerCase(),
        surname: student.surname.replaceAll(' ', '').charAt(0).toUpperCase() + student.surname.replaceAll(' ', '').substring(1).toLowerCase(),
        lastname: student.lastname.replaceAll(' ', '').charAt(0).toUpperCase() + student.lastname.replaceAll(' ', '').substring(1).toLowerCase(),
        birthday: student.birthday,
        studyStart: Number(student.studyStart),
        faculty: student.faculty.trim().charAt(0).toUpperCase() + student.faculty.trim().substring(1).toLowerCase(),
      };
      if (JSON.stringify(studentForCheck) === JSON.stringify(studentNew)) {
        alert('Данный студент уже есть в списке');
        return;
      }
    }

    saveStudentOnServer(studentNew).then((student) => {
      savedStudentsArray.push(student);
      renderStudentsTable(savedStudentsArray);
    })

    studentName.value = '';
    studentSurname.value = '';
    studentMiddleName.value = '';
    studentBirthDateInput.value = '';
    studyStartYearInput.value = '';
    faculty.value = '';

  })

  //Filters and Sorting 

  function addSortListeners() {
    let fullNameOrderAsk = 1;
    let facultyOrderAsk = 1;
    let bDayOrderAsk = 1;
    let studyYearOrderAsk = 1;

    document.getElementById('thead-fullname').addEventListener('click', () => {
      savedStudentsArray.sort((a, b) => (a.surname + a.name + a.lastname).toLowerCase().trim() > (b.surname + b.name + b.lastname).toLowerCase().trim() ? fullNameOrderAsk : -1 * fullNameOrderAsk);
      renderStudentsTable(savedStudentsArray);
      fullNameOrderAsk *= -1;
    });

    document.getElementById('thead-faculty').addEventListener('click', () => {
      savedStudentsArray.sort((a, b) => a.faculty.toLowerCase() > b.faculty.toLowerCase() ? facultyOrderAsk : -1 * facultyOrderAsk);
      renderStudentsTable(savedStudentsArray);
      facultyOrderAsk *= -1;
    });

    document.getElementById('thead-bday').addEventListener('click', () => {
      savedStudentsArray.sort((a, b) => new Date(a.birthday) < new Date(b.birthday) ? bDayOrderAsk : -1 * bDayOrderAsk);
      renderStudentsTable(savedStudentsArray);
      bDayOrderAsk *= -1;
    });

    document.getElementById('thead-study-years').addEventListener('click', () => {
      savedStudentsArray.sort((a, b) => a.studyStart > b.studyStart ? studyYearOrderAsk : -1 * studyYearOrderAsk);
      renderStudentsTable(savedStudentsArray);
      studyYearOrderAsk *= -1;
    });
  }

  function filter() {
    const filteredByNameArray = [];
    const fullnameFilter = document.getElementById('find-full-name').value.toLowerCase();

    for (const item of savedStudentsArray) {
      if (fullnameFilter.split(' ').every(element => [item.surname, item.name, item.lastname].join(' ').toLowerCase().includes(element))) {
        filteredByNameArray.push(item);
      }
    }

    const facultyFilter = document.getElementById('find-faculty').value.toLowerCase();

    const filteredByFacultyArray = [];

    for (const item of filteredByNameArray) {
      if (item.faculty.toLowerCase().includes(facultyFilter)) {
        filteredByFacultyArray.push(item);
      }
    }

    const startStudyYearFilter = +document.getElementById('find-start-study-year').value;
    let filteredByStartStudyYearArray = filteredByFacultyArray;

    if (startStudyYearFilter) {
      filteredByStartStudyYearArray = [];
      for (const item of filteredByFacultyArray) {
        if (+item.studyStart === startStudyYearFilter) {
          filteredByStartStudyYearArray.push(item);
        }
      }
    }

    const lastStudyYearFilter = +document.getElementById('find-last-study-year').value;
    let filteredByLastStudyYearArray = filteredByStartStudyYearArray;

    if (lastStudyYearFilter) {
      filteredByLastStudyYearArray = [];
      for (const item of filteredByStartStudyYearArray) {
        if ((+item.studyStart + 4) === lastStudyYearFilter) {
          filteredByLastStudyYearArray.push(item);
        }
      }
    }

    return filteredByLastStudyYearArray;
  }

  function addFilterListeners() {

    document.getElementById('find-full-name').addEventListener('input', () => {
      renderStudentsTable(filter());
    })

    document.getElementById('find-faculty').addEventListener('input', () => {
      renderStudentsTable(filter());
    })

    document.getElementById('find-start-study-year').addEventListener('input', () => {
      if (document.getElementById('find-start-study-year').value.length === 4) {
        renderStudentsTable(filter());
      }
      if (document.getElementById('find-start-study-year').value.length === 0) {
        renderStudentsTable(filter());
      }
    })

    document.getElementById('find-last-study-year').addEventListener('input', () => {
      if (document.getElementById('find-last-study-year').value.length === 4) {
        renderStudentsTable(filter());
      }
      if (document.getElementById('find-last-study-year').value.length === 0) {
        renderStudentsTable(filter());
      }
    })

  }

})();
