-- Active: 1708009143398@@127.0.0.1@3306@warframedroppage
CREATE DATABASE IF NOT EXISTS warframedroppage;

USE warframedroppage;

DROP TABLE IF EXISTS drops;
CREATE table if not EXISTS drops(
    id INT auto_increment PRIMARY KEY,
    location VARCHAR(255),
    rotation VARCHAR(255),
    item_name VARCHAR(255),
    rarity_chance VARCHAR(255)
);