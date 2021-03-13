INSERT INTO public.med_users
(useremail, user_name, userpassword)
VALUES
('tester@yahoo.com', 'tester', '$2a$12$HHdLMrecaCgeLngGr1HcIOCRC5p.NnoVX3niwg7SVFK/62BDKpgqm');
('dunder@yahoo.com', 'dunder', '$2a$12$PAYRea6MkyEwrxlUNN1YP.5Rw.3kgrGT/3YfHv13oX02923yjHW0G');
('lexlor@yahoo.com', 'lexlor', '$2a$12$KX0QyJ1LctBAjUKeZoEBhO9Egj0a4M3dY/B2LUvzV15D9yLDeT8Fy');


INSERT INTO public.transport_entry
(starting_location, destination_location, date_of_transport, mileage, create_date, "requested_userId")
VALUES('{
	"address": "21 jump st",
	"lat": 40.712776,
	"lon": -74.005974
}', '{
	"address": "21 jump st",
	"lat": 40.712776,
	"lon": -74.005974
}', now(), 12, now(), 1);