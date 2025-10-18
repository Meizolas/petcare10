-- Add RLS policies for admin to manage all appointments
CREATE POLICY "Admins can view all appointments"
ON public.appointments
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all appointments"
ON public.appointments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));