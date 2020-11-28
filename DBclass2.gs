//create folder /DB
//save this as server.bin -> /DB/server.bin
// syntax: password Table arg,args,,
// __table indexes__
// table = DataBase.Get_Table("Users")
// table.insert(1,"USER","ght")
// table.NewLine("STRING:KEKE:keke@test.com:123456"
// table.find("1","USER")
// table.del_inx(1)
// table.del()
// DataBase.login("username:password:test@mail.com")
// DataBase.AddUser("Group","username","test@mail.com","password"
// ssh root@Sweet 52.57.158.211 999

DataBase = {}
DataBase.init = function()
	self.root_pass = "Sweet" 	// Local root pass
	self.password = "password444" // Database password
	self.salt = "123456"			// Password salt
	self.Tables = []
	self.shell = get_shell("root",self.root_pass)
	if typeof(self.shell) != "shell" then return "root: login failed"
	self.pc = self.shell.host_computer
	self.pc.create_folder("/","DB")
	self.pc.create_folder("/DB","Tables")
	self.pc.touch("/DB","DataOut")
	self.DataOut = self.pc.File("/DB/DataOut")
	self.DbPath = "/DB/Tables"
	self.DbFile = self.pc.File("/DB/Tables")
	self.New_Table(self.DbPath,"Users","GROUP:USER:EMAIL:PASS")
	table = DataBase.Get_Table("Users")
	table.NewLine("ADMINS:ADMIN:Admin@support.com:"+md5(self.password+self.salt))
	DataBase.secure()
end function

DataBase.secure = function()
	self.pc.create_user("SQL","passSQL2")
	f = self.pc.File("/home")
	if f then f.delete
	f = self.pc.File("/")
	f.chmod("o-wrx",1)
	f.chmod("g-wrx",1)
	f.chmod("u-wrx",1)
	f.set_owner("root",1)
	f.set_group("root",1)
	f = self.pc.File("/etc/passwd")
	f.set_content("")
	f = self.pc.File("/home/guest")
	if f then f.delete
	f = self.pc.File("/DB/server.bin")
	if f then
		f.chmod("o+x")
		f.chmod("g+x")
		f.chmod("u+x")
	end if
	f = self.pc.File("/DB/DataOut")
	f.chmod("o+r")
	f.chmod("g+r")
	f.chmod("u+r")
end function

DataBase.AddUser = function(info,user,mail,password)
	table = DataBase.Get_Table("Users")
	for line in table.Lines
		if line == "" then continue
		if line.split(":")[2] == user then return "exist already"
	end for
	str = info + ":" + user + ":" + mail + ":" + md5(self.password+self.salt)
	if table.HeadLen != str.split(":").len + 1 then return "not egual len"
	if table.Lines.indexOf(str) == null then
		table.NewLine(str)
		return "true"
	end if
	return "false"
end function

DataBase.New_Table = function(Folder,Name,Head)
	if Name != "Users" and Name != "Config" then print(Folder+  " " + Name + " " + Head)
	if self.pc.File(self.DbPath+"/"+Name) then return "Table exist"
	if Head == null then return null
	self.pc.touch(self.DbPath,Name)
	table = self.pc.File(self.DbPath+"/"+Name)
	table.set_content("0:"+Head+"\n")
	DataBase.InitTable(table)
	return "true"
end function

DataBase.Get_Table = function(Table)
	for folder in self.DbFile.get_files
		table =DataBase.InitTable(folder)
		if table.Name == Table then return table 
	end for
	return null
end function

DataBase.InitTable = function(file)
	table = {}
	table.Name = file.name
	table.file = file
	table.Lines = table.file.get_content.split("\n") 
	table.Head = table.Lines[0].split(":")
	table.HeadLen = table.Lines[0].split(":").len
	table.NewInx = str(table.Lines[-2].split(":")[0].to_int + 1)
	
	table.NewLine = function(Line)
		if self.file.get_content.indexOf(Line) != null then return
		Line = (table.NewInx)+":"+Line
		if self.HeadLen != Line.split(":").len then return "not egual len"
		self.file.set_content(self.file.get_content + Line + "\n")
		return "true"
	end function
	
	table.insert = function(inx,head,data)
		output = ""
		i = self.Head.indexOf(head)
		for line in self.Lines
			if line == "" then continue
			cell = line.split(":")
			if cell[0] != str(inx) then 
				output = output + line + "\n"
			else
				s = cell[:i]
				e = cell[i+1:]
				x = s + [data] + e
				output = output + x.join(":") + "\n"
				table.file.set_content(output)
				return "true"
			end if
		end for
		return "false"
	end function
	
	table.del_inx = function(inx)
		res = "false"
		out = ""
		for line in self.Lines
			if line == "" then continue
			s = line.split(":")
			if s[0] != str(inx) then out = out + line + "\n"
			if s[0] == str(inx) then res = "true"
		end for
		table.file.set_content(out)
		return res
	end function
	
	table.del = function()
		out = self.file.delete
		return "deleted!"
	end function
	
	table.find = function(inx,head="")
		if inx == "*" then
			i = self.Head.indexOf(head)
			if i == null then return "null"
			out = []
			for line in self.Lines
				if line == "" then continue
				s = line.split(":")
				//if s[0] == "0" then continue
				target = s[i]
				out.push(target)
			end for
			return out.join(":")
		end if
		
		i = self.Head.indexOf(head)
		for line in self.Lines
			if line == "" then continue
			s = line.split(":")
			//if s[0] == "0" then continue
			if s[0] == inx and head == "*" then return line.split(":").join(":")
			if self.Head.indexOf(head) == null then continue
			if line[0] != str(inx) then continue
			if head == "" then return line
			return s[i]
		end for
		return "false"
	end function
	
	self.Tables.push(table)
	return table
end function

DataBase.Login = function(string)
	table = DataBase.Get_Table("Users")
	string = string.split(":")
	if string.len != 3 then return "false"
	for line in table.Lines
		if line.split(":")[0] == "0" then continue
		if line == "" then continue
		user = line.split(":")[2]
		pass = line.split(":")[4]
		mail = line.split(":")[3]
		if md5(string[1]+self.salt) == pass and string[0] == user then return "true"
		if string[2] == mail then return "true"
	end if
end for
return "false"
end function

DataBase.offset_text = function(text)
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

DataBase.SendResult = function(result)
	//self.DataOut.set_content(DataBase.offset_text(result))
	self.DataOut.set_content(result)
	return "true"
end function

DataBase.SanitizeInput = function(input)
	Out = []
	illegal = "\()[]{}+-#!$%&<>,'=?"
	for item in input
		for v in item.values
			if illegal.indexOf(v) != null then 
				return("Illegal charset")
			end if
		end for
		Out.push(item)
	end for
	return Out
end function

DataBase.GetTables = function()
	out = ""
	for table in  self.pc.File("/DB/Tables").get_files
		out = out + table.name+ ":"
	end for
	return out
end function

DataBase.Handle = function()
	self.SendResult("")
	result = "invalid syntax"
	args = self.SanitizeInput(params)
	if args.len < 2 then ;self.SendResult(result);exit;end if
	pass = args[0]
	table = DataBase.Get_Table(args[1])
	if pass != self.password then return "Logind failed"
		
	if args.len == 2 and args[1] == "tables" then 
		result = self.GetTables()
		self.SendResult(result)
		return result
	end if
	if args.len == 5 and args[1] == "newtable" then 
		result = DataBase.New_Table(args[2],args[3],args[4])
		self.SendResult(result)
		return result
	end if
		
	if table == null then return "Table not found"
	if args.len == 7 and args[2] == "adduser" then result = DataBase.AddUser(args[3],args[4],args[5],args[6])
	if args.len == 6 and args[2] == "insert" then result = table.insert(args[3].to_int,args[4],args[5])
	if args.len == 5 and args[2] == "find" then result = table.find(args[3],args[4])
	if args.len == 4 and args[2] == "newline" then result = table.NewLine(args[3])
	if args.len == 4 and args[2] == "login" then result = DataBase.Login(args[3])
	if args.len == 4 and args[2] == "del_inx" then result = table.del_inx(args[3].to_int)
	if args.len == 3 and args[2] == "del" then result = table.del()
	if args.len == 3 and args[2] == "wipe" then result = ""
	self.SendResult(result)
	return result
end function
DataBase.init()
DataBase.Handle()


	
	
	
	