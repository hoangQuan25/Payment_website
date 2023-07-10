create database cua_hang_banh_mi;
\c cua_hang_banh_mi
set client_encoding to 'UTF-8';

create table nhan_vien (
    id serial primary key,
    ten varchar(255),
    sdt varchar(20),
    mail varchar(255),
    gioi_tinh varchar(10),
    ngay_sinh date
);

insert into nhan_vien (ten, sdt, mail, gioi_tinh, ngay_sinh) values 
    ('Nguyen Hoang Quan', '12243241', 'quannguyen5691@gmail.com', 'Nam', '2003-02-25'),
    ('Le Quoc Viet', '134134141', 'viet.lq12321@gmail.com', 'Nu', '2003-02-02'),
    ('Vo Son Long', '23213343', 'long.vs4123@gmail.com', 'Nu', '2003-01-01');

create table san_pham (
    id varchar(10) primary key,
    ten varchar(255),
    gia int
);

insert into san_pham values 
    ('P01', 'Banh mi trung', '25000'),
    ('P02', 'Banh mi bo', '30000'),
    ('P03', 'Banh mi ruoc', '12000');

create table hoa_don (
    id_hoa_don serial primary key,
    id_nhan_vien int,
    thoi_gian_thanh_toan timestamp,
    tong_tien int,
    foreign key (id_nhan_vien) references nhan_vien(id)
);

create table chi_tiet_hoa_don (
    id_hoa_don int,
    id_san_pham varchar(10),
    so_luong int,
    foreign key (id_hoa_don) references hoa_don(id_hoa_don),
    foreign key (id_san_pham) references san_pham(id)
);
