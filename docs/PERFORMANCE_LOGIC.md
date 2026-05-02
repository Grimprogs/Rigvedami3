# Performance Metrics Calculation Logic

This document explains the mathematical formulas used to analyze employee performance in ZTasks.

## 1. Success Rate (%)
This is the most basic metric of task completion.
- **Data Source**: Total tasks assigned to the employee vs. tasks marked as `completed`.
- **Formula**: `(Completed Tasks / Total Assigned Tasks) * 100`
- **Use Case**: General reliability check.

## 2. Efficiency (Average Speed)
This measures how fast an employee works once they start a task.
- **Data Source**: The time difference between `started_at` and `approved_at`.
- **Logic**:
    1. For every completed task, calculate duration: `duration = approved_at - started_at`.
    2. Sum all durations.
    3. Divide by the number of completed tasks.
- **Formula**: `Total Duration (ms) / Number of Completed Tasks / 3,600,000 = Avg Hours`
- **Edge Cases**: Tasks that were never officially "Started" (no `started_at` timestamp) are excluded from this specific average to maintain data accuracy.

## 3. Punctuality (Deadline Accuracy)
This measures how well an employee respects company deadlines.
- **Data Source**: Comparison between the `approved_at` timestamp and the `due_date` + `due_time`.
- **Logic**: A task is "On-Time" if it was approved **on or before** the exact minute of the deadline.
- **Formula**: `(Number of On-Time Completions / Total Completed Tasks) * 100`
- **Use Case**: Critical for time-sensitive departments like Sales or Logistics.

---
*Note: All calculations are performed in the browser for instant feedback, but rely on the precise timestamps stored in the Supabase database.*
