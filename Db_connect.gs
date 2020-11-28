socket = get_shell.connect_service("52.57.158.211",999,"SQL","passSQL2")
DBPASS = "password444"
user = "guest"
pass = "password444"
mail = user_mail_address
if mail == null then mail = "NONE"
str = DBPASS + " "  + "Users" + " " + "login" + " " + user + ":"+pass+":"+mail
socket.launch("/DB/server.bin", str)
DataOut = socket.host_computer.File("/DB/DataOut")

offset_text = function(text)
	key = char(10100)+char(10054)+char(10074)+char(10104)+char(10105)+char(10004)+char(10133)+char(10070)
	o = []
	out = ""
	for c in text
		out = out + c + "-> "
		xor = bitwise("^",code(c),code(key[__c_idx%key.len]))
		o.push(char(xor))
		out = out + xor + "\n"
	end for
	return o.join("")
end function

//if offset_text(DataOut.get_content) != "true" then exit("Access denied!")
if DataOut.get_content != "true" then exit("Access denied!")

help = function()
	print("")
	print("* <color=white>tables")
	print("* <color=white>adduser 		[group] 		[user][mail]    [password]")
	print("* <color=white>[table] 		insert 		[inx] [header]  [data]") 
	print("* <color=white>[table] 		find 			[indx/*] [head/*]	(inx=line number | head = cell on header)")
	print("* <color=white>[table] 		newline 		[string:string:string:string]  	(new line must be splitted to header len)")
	print("* <color=white>newtable 	 /DB/Tables 	[NAME][CELL:CELL:CELL...]")
	print("")
end function

while true
	input = user_input("(<color=white>cmdDB</color>)> ")
	if input == "help" then help()
	if input.indexOf("adduser") != null then socket.launch("/DB/server.bin",DBPASS + " " + "Users" + " " + input)
	if input.indexOf("adduser") == null then socket.launch("/DB/server.bin",DBPASS + " " + input)
	print("> " +DataOut.get_content)
	//print("> " +offset_text(DataOut.get_content))
end while





