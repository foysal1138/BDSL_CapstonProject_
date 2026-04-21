CREATE DATABASE BDSL_Database;
USE BDSL_Database;

-- Create Patients Table --

CREATE TABLE patients ( 
patient_id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(50) NOT NULL, 
surname VARCHAR(50), 
last_name VARCHAR(50) NOT NULL, 
gender ENUM('Male', 'Female', 'Other') NOT NULL, 
date_of_birth DATE NOT NULL, 
age INT NOT NULL, address TEXT NOT NULL, 
nid_or_birth_cert VARCHAR(30) UNIQUE, 
blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'), 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

-- Patients Info --

INSERT INTO patients 
(first_name, surname, last_name, gender, date_of_birth, age, address, nid_or_birth_cert, blood_group)
VALUES
('Rahim','Uddin','Khan','Male','1998-05-14',26,'Dhaka','199812345001','B+'),
('Karim','Ahmed','Hossain','Male','1985-11-22',39,'Chattogram','198511223002','O+'),
('Ayesha','Begum','Rahman','Female','2001-02-10',24,'Sylhet','200102103003','A+'),
('Nusrat','Jahan','Sultana','Female','1995-07-30',29,'Rajshahi','199507304004','AB-'),
('Tanvir','Hasan','Mahmud','Male','1992-09-18',32,'Khulna','199209185005','O-'),

('Sadia','Akter','Mim','Female','2000-03-12',25,'Dhaka','200003126006','A-'),
('Fahim','Reza','Chowdhury','Male','1997-06-25',27,'Comilla','199706257007','B-'),
('Imran','Ali','Sheikh','Male','1988-01-15',37,'Barisal','198801158008','O+'),
('Shila','Parvin','Nipa','Female','1999-12-01',25,'Rangpur','199912019009','AB+'),
('Rifat','Islam','Robin','Male','2002-08-20',22,'Mymensingh','200208201010','A+'),

('Jannat','Ara','Tania','Female','1996-04-17',28,'Dhaka','199604171011','B+'),
('Hasib','Mahmud','Rafi','Male','1994-10-05',30,'Khulna','199410051012','O-'),
('Mehedi','Hasan','Rony','Male','1993-02-22',31,'Jessore','199302221013','A-'),
('Sumaiya','Kabir','Liza','Female','2001-09-11',23,'Sylhet','200109111014','AB+'),
('Arif','Hossain','Shuvo','Male','1990-06-06',34,'Dhaka','199006061015','B-'),

('Nabila','Sultana','Riya','Female','1998-01-09',26,'Chattogram','199801091016','O+'),
('Sabbir','Rahman','Sami','Male','2000-11-13',24,'Cumilla','200011131017','A+'),
('Farzana','Akter','Maya','Female','1997-07-19',27,'Rajshahi','199707191018','B+'),
('Rakib','Hasan','Rasel','Male','1995-03-03',29,'Khulna','199503031019','O-'),
('Mitu','Begum','Sumi','Female','2002-05-28',22,'Barisal','200205281020','AB-'),

('Jahid','Islam','Nayeem','Male','1991-12-14',33,'Dhaka','199112141021','A+'),
('Tariq','Mahmud','Faisal','Male','1989-08-08',35,'Sylhet','198908081022','B-'),
('Samira','Haque','Tuli','Female','2003-02-02',21,'Rangpur','200302021023','O+'),
('Rashid','Khan','Adib','Male','1996-06-30',28,'Dhaka','199606301024','AB+'),
('Nadia','Rahman','Lamia','Female','1999-10-10',25,'Chattogram','199910101025','A-'),

('Sajid','Hossain','Rafiq','Male','1994-04-04',30,'Khulna','199404041026','B+'),
('Lubna','Akter','Nila','Female','2001-07-07',23,'Sylhet','200107071027','O-'),
('Rony','Islam','Sarkar','Male','1992-02-18',32,'Rajshahi','199202181028','A+'),
('Mahi','Sultana','Nusrat','Female','2000-09-09',24,'Barisal','200009091029','AB-'),
('Tuhin','Ahmed','Shakil','Male','1997-05-05',27,'Dhaka','199705051030','B-'),

('Shamim','Uddin','Arman','Male','1987-11-11',37,'Chattogram','198711111031','O+'),
('Rima','Khatun','Sadia','Female','1998-08-08',26,'Rangpur','199808081032','A+'),
('Masud','Rahman','Tarek','Male','1993-03-21',31,'Khulna','199303211033','B+'),
('Pinky','Akter','Rupa','Female','2002-12-12',22,'Dhaka','200212121034','O-'),
('Zahid','Hossain','Imtiaz','Male','1991-01-01',33,'Sylhet','199101011035','AB+'),

('Sultana','Begum','Nasrin','Female','1986-06-06',38,'Rajshahi','198606061036','A-'),
('Faisal','Karim','Jubayer','Male','1995-09-09',29,'Dhaka','199509091037','B+'),
('Lamia','Rahman','Nitu','Female','2003-03-03',21,'Barisal','200303031038','O+'),
('Shakib','Alam','Riyad','Male','1998-07-07',26,'Khulna','199807071039','AB-'),
('Tania','Sultana','Mou','Female','2000-10-10',24,'Chattogram','200010101040','A+'),

('Rashed','Khan','Tanvir','Male','1992-12-25',32,'Dhaka','199212251041','B-'),
('Nipa','Akter','Rina','Female','1997-11-11',27,'Sylhet','199711111042','O-'),
('Imtiaz','Hossain','Sabbir','Male','1994-05-05',30,'Rajshahi','199405051043','A+'),
('Farhan','Ahmed','Rafi','Male','2001-01-15',23,'Khulna','200101151044','AB+'),
('Jui','Begum','Tisha','Female','2002-04-04',22,'Dhaka','200204041045','B+'),

('Naim','Islam','Rakib','Male','1996-09-09',28,'Chattogram','199609091046','O+'),
('Sonia','Rahman','Mitu','Female','1999-06-06',25,'Sylhet','199906061047','A-'),
('Adnan','Karim','Shuvo','Male','1993-08-08',31,'Barisal','199308081048','B+'),
('Rupa','Akter','Nishi','Female','2000-02-02',24,'Dhaka','200002021049','AB-'),
('Sohel','Uddin','Rasel','Male','1991-07-07',33,'Khulna','199107071050','O+');

-- Create Doctors Table --

CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50),
    last_name VARCHAR(50),

    gender ENUM('Male', 'Female', 'Other') NOT NULL,

    bmdc_reg_no VARCHAR(20) NOT NULL UNIQUE,

    date_of_birth DATE NOT NULL,

    age INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Info --

INSERT INTO doctors 
(first_name, surname, last_name, gender, bmdc_reg_no, date_of_birth, age)
VALUES
('Foysal', NULL, 'Ahmed', 'Male', 'A-00001', '1990-01-01', 34),
('Amina', 'Khatun', 'Rahman', 'Female', 'A-00002', '1985-05-12', 39),
('Tanvir', 'Hasan', 'Mahmud', 'Male', 'A-00003', '1992-09-18', 32),
('Sadia', 'Akter', 'Mim', 'Female', 'A-00004', '1998-03-25', 26),
('Imran', 'Ali', 'Sheikh', 'Male', 'A-00005', '1987-07-07', 37),

('Nusrat', 'Jahan', 'Sultana', 'Female', 'A-00006', '1995-07-30', 29),
('Rashid', 'Khan', 'Adib', 'Male', 'A-00007', '1991-12-14', 33),
('Farzana', 'Akter', 'Maya', 'Female', 'A-00008', '1997-07-19', 27),
('Sabbir', 'Rahman', 'Sami', 'Male', 'A-00009', '2000-11-13', 24),
('Lubna', 'Akter', 'Nila', 'Female', 'A-00010', '2001-07-07', 23),

('Jahid', 'Islam', 'Nayeem', 'Male', 'A-00011', '1991-12-14', 33),
('Tariq', 'Mahmud', 'Faisal', 'Male', 'A-00012', '1989-08-08', 35),
('Samira', 'Haque', 'Tuli', 'Female', 'A-00013', '2003-02-02', 21),
('Zahid', 'Hossain', 'Imtiaz', 'Male', 'A-00014', '1991-01-01', 33),
('Lamia', 'Rahman', 'Nitu', 'Female', 'A-00015', '2003-03-03', 21),

('Shakib', 'Alam', 'Riyad', 'Male', 'A-00016', '1998-07-07', 26),
('Tania', 'Sultana', 'Mou', 'Female', 'A-00017', '2000-10-10', 24),
('Rashed', 'Khan', 'Tanvir', 'Male', 'A-00018', '1992-12-25', 32),
('Nipa', 'Akter', 'Rina', 'Female', 'A-00019', '1997-11-11', 27),
('Farhan', 'Ahmed', 'Rafi', 'Male', 'A-00020', '2001-01-15', 23),

('Jui', 'Begum', 'Tisha', 'Female', 'A-00021', '2002-04-04', 22),
('Adnan', 'Karim', 'Shuvo', 'Male', 'A-00022', '1993-08-08', 31),
('Sonia', 'Rahman', 'Mitu', 'Female', 'A-00023', '1999-06-06', 25),
('Sohel', 'Uddin', 'Rasel', 'Male', 'A-00024', '1991-07-07', 33),
('Rupa', 'Akter', 'Nishi', 'Female', 'A-00025', '2000-02-02', 24);