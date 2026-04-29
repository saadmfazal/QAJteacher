QAJ Teacher Portal - Separate Mobile-Friendly Teacher App
========================================================

Purpose
-------
This is a separate teacher-facing portal, not the admin portal.
It is built with plain HTML/CSS/JavaScript and Supabase JS CDN, matching the current QAJ admin staging style.

Included files
--------------
index.html
styles.css
app.js
supabase-config.example.js
teacher_portal_support_sql.sql
README.txt

Setup
-----
1. Copy this folder as a separate project/repo, for example:
   qaj-teacher-portal

2. Rename:
   supabase-config.example.js -> supabase-config.js

3. Add your Supabase public URL and anon key in supabase-config.js.
   Do NOT add service_role key.

4. Run teacher_portal_support_sql.sql in Supabase if the messages/policy tables do not already exist.

5. Make sure every teacher login has a linked row in qaj_user_profiles:
   user_id = auth user id
   tid = teacher TID
   role = teacher or head_teacher
   is_active = true

6. Deploy as a separate Netlify site or separate GitHub repo.
   Build command: empty
   Publish directory: .

Main views
----------
Home:
- Next class
- Today's classes
- Missed entries
- Message from QAJ

Students:
- Assigned individual students
- Assigned batch/group students
- Student basic details popup

Schedules:
- Monthly schedule list
- Pending entries
- Completed entries
- Individual/group filters
- Submit individual class entries
- Submit batch class entries and attendance

Past Entries:
- View submitted entries for the selected month

My Times:
- View available/utilized/inactive teacher time slots
- Add availability in 30-minute slots

Messages:
- Send message to admin or head teacher
- View sent messages/announcements

Policy & SOP:
- Reads active policy documents from qaj_policy_documents
- Shows fallback text if table/data is not ready

Profile:
- Teacher basic profile details

Important existing dependencies
-------------------------------
This portal assumes these existing tables/functions already exist from the admin portal:

qaj_user_profiles
qajp5_teacher_db
qajp5_student_db
qaj_courses
qaj_course_levels
qaj_individual_class_assignments
qaj_batch_teachers
qaj_batches
qaj_batch_students
qaj_teacher_time_blocks
qaj_class_sessions
qaj_submit_class_entry RPC

Important note
--------------
This is a strong first version for teacher-facing use, but it still depends on your Supabase RLS policies.
If data does not load, check RLS first.

The teacher portal intentionally does not allow teachers to edit student records, course data, batch data, or core schedules.
Teachers can:
- View their assigned students/classes
- Submit entries
- Add available time slots
- Message admin/head teacher
- Read policies/SOP
