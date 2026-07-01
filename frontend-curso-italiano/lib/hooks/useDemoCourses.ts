"use client";

import { useEffect, useState } from "react";
import type { Course } from "@lms-mocks/types";
import { courses as seedCourses } from "@lms-mocks/courses";
import { getStoredCourses } from "@lms-mocks/storage";

export function useDemoCourses() {
  const [courses, setCourses] = useState<Course[]>(seedCourses);

  useEffect(() => {
    setCourses(getStoredCourses());
    const interval = setInterval(() => setCourses(getStoredCourses()), 2000);
    return () => clearInterval(interval);
  }, []);

  return courses;
}
