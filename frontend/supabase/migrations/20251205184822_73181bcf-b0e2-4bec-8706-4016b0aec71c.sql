-- Create a secure function to get test questions WITHOUT correct answers
CREATE OR REPLACE FUNCTION public.get_test_questions_for_student(p_test_id uuid)
RETURNS TABLE (
  id uuid,
  test_id uuid,
  question text,
  options jsonb,
  marks integer,
  order_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tq.id,
    tq.test_id,
    tq.question,
    tq.options,
    tq.marks,
    tq.order_index
  FROM public.test_questions tq
  JOIN public.test_series ts ON ts.id = tq.test_id
  JOIN public.enrollments e ON e.course_id = ts.course_id
  WHERE tq.test_id = p_test_id
    AND e.student_id = get_profile_id(auth.uid())
  ORDER BY tq.order_index;
$$;

-- Create a function to get answers ONLY after test completion
CREATE OR REPLACE FUNCTION public.get_test_answers_after_completion(p_test_id uuid)
RETURNS TABLE (
  question_id uuid,
  correct_answer integer,
  explanation text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tq.id as question_id,
    tq.correct_answer,
    tq.explanation
  FROM public.test_questions tq
  WHERE tq.test_id = p_test_id
    AND EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.test_id = p_test_id
        AND ta.student_id = get_profile_id(auth.uid())
        AND ta.completed_at IS NOT NULL
    );
$$;

-- Drop the existing permissive policy that exposes answers
DROP POLICY IF EXISTS "Students can view test questions" ON public.test_questions;

-- Create a more restrictive policy - students can only see questions through the secure function
-- This policy blocks direct table access while allowing the SECURITY DEFINER functions to work
CREATE POLICY "Block direct access to test questions"
ON public.test_questions
FOR SELECT
TO authenticated
USING (false);