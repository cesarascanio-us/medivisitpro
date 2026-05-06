import sys

path = r'c:\Users\cesar\Cesar Ascanio\CA_CORE\Proyectos_Dev\MediVisitPro\src\pages\Products.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find the broken section
start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if 'ntent>' in line and i > 300:
        start_index = i - 1 # line 320 (0-indexed is 319)
    if '</Card>' in line and i > 330 and start_index != -1:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    new_content = """      <Card className="card-elite p-6 border border-border/40 bg-card rounded-[2rem] shadow-premium-sm">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="LOCALIZAR POR NOMBRE, PRINCIPIO ACTIVO O INDICACIÓN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-14 pl-16 bg-muted/10 border-none focus-visible:ring-primary/20 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-inner placeholder:text-muted-foreground/30 text-foreground"
              />
            </div>
 
            <div className="flex flex-wrap items-center gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-14 w-full md:w-64 bg-muted/10 border-none focus:ring-primary/20 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-inner text-foreground px-8">
                  <SelectValue placeholder="CATEGORÍA" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 bg-card font-black text-[10px] uppercase tracking-widest">
                  <SelectItem value="all">TODOS LOS PRODUCTOS</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
 
              <div className="h-8 w-[1px] bg-border/40 mx-2 hidden xl:block" />
 
              <Button variant="outline" onClick={triggerImport} disabled={importing} className="h-14 px-8 border-border/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-premium-sm flex items-center gap-3">
                {importing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Importar
              </Button>
 
              <Button variant="outline" onClick={handleExport} className="h-14 px-8 border-border/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-premium-sm flex items-center gap-3">
                <Download className="h-5 w-5" />
                Exportar
              </Button>
 
              <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)} className="h-14 w-14 border border-border/40 rounded-2xl bg-muted/10 shadow-inner hover:bg-card hover:shadow-premium-sm text-muted-foreground hover:text-primary transition-all">
                <HelpCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
      </Card>
"""
    # Replace lines from start_index to end_index (inclusive of end_index because it's </Card>)
    # Wait, the end_index is the line with </Card>
    # We want to replace from line 321 (indexed 320) to line 342 (indexed 341)
    # Actually, let's just find the start of the broken part and the end of the broken part.
    
    # Broken part starts at 'ntent>'
    # and ends at '</Card>' which is on line 342.
    
    lines[start_index:end_index+1] = [new_content + '\n']
    
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Success")
else:
    print(f"Failed to find indices: {start_index}, {end_index}")
