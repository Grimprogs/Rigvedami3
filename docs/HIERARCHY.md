# Organizational Hierarchy Model

This document defines the "Waterfall" access and visibility rules for the ZTasks platform.

## 1. Role Definitions
- **Super Admin**: Global authority. Stealth-enabled (invisible to all other roles).
- **Admin**: Departmental or high-level management.
- **Employee**: Individual contributor.

## 2. Departmental Waterfall
The core principle of ZTasks is that visibility flows downward based on Departmental Rank.
- **Rules**:
    1. A user in a **higher-ranked** department (e.g., Management) can view all users in **lower-ranked** departments (e.g., Sales, Logistics).
    2. A user in a **lower-ranked** department **cannot** look up into a higher-ranked department.
    3. Users in the **same** department can see each other in the directory, but cannot view each other's performance profiles unless one is a manager (Job Rank).

## 3. Job Rank Hierarchy
Within the same department, Job Titles determine authority.
- **Rules**:
    1. A user with a **higher Job Rank** (closer to index 0 in the ranking list) can view and manage colleagues in the same department.
    2. Users with equal rank cannot manage each other.

## 4. Permission Matrix (The "Eye" Button)
The "View Profile" button is the gateway to sensitive performance data (Efficiency, Punctuality, etc.).

| Viewer | Target | Action | Result |
| :--- | :--- | :--- | :--- |
| Any User | Higher Rank User | View | **Access Denied** |
| Admin | Same Dept / Lower Rank | View | **Allowed** |
| Admin | Lower Dept User | View | **Allowed** |
| Super Admin | Any non-Super Admin | View | **Allowed** (Global) |

## 5. Metadata Visibility & Transparency
- **Directory Transparency**: To ensure everyone knows who to contact in which department, **Job Titles** and **Department names** are visible to all users on the employee cards.
- **Access Restriction**: The **"Eye" button** (View Profile) and all **Edit/Delete** actions are strictly restricted. They will only appear if the viewer is hierarchically senior to the target user.
- **Name Links**: User names are only clickable (linking to the performance dashboard) if the viewer has the required seniority.
