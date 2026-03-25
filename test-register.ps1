$body = '{"email":"test999@test.cz","password":"testtest123","name":"Test User"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json
