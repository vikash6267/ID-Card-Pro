# 📸 Front & Back Side Background Upload Guide

## 🎯 Step-by-Step Process

### **Step 1: Excel Upload Karo (Pehle)**
```
1. Application open karo
2. "Upload Excel" button pe click karo
3. Apni Excel file select karo (.xlsx ya .csv)
4. Excel data load ho jayega
```

---

### **Step 2: Front Side Background Upload**

#### **Option A: Static Background (Ek hi background sabke liye)**
```
1. "Front" tab pe click karo
2. "Upload Backgrounds" button pe click karo
3. Modal open hoga
4. Directly image upload karo
5. "Save Changes" pe click karo
```

#### **Option B: Dynamic Background (Different backgrounds for different groups)**
```
1. "Front" tab pe click karo
2. "Upload Backgrounds" button pe click karo
3. Modal mein:
   
   a) Column Select karo:
      - Dropdown se column choose karo (e.g., "Class", "Department", "Grade")
   
   b) Group Create karo:
      - "Add Group" button pe click karo
      - Values select karo (e.g., "Class A", "Class B")
      - Ya "Select All Values" check karo (sabke liye same background)
      - "Create Group" pe click karo
   
   c) Background Upload karo:
      - Har group ke box pe click karo
      - Image select karo
      - Thumbnail show hoga
   
   d) Card Size Set karo:
      - Width: 86mm (default)
      - Height: 54mm (default)
      - Ya custom size dalo
      - Rotate button se orientation change karo
   
   e) "Save Changes" pe click karo
```

---

### **Step 3: Back Side Background Upload**

#### **Important Rule:**
⚠️ **Back side upload karne se pehle Front side configure karna ZAROORI hai!**

#### **Process:**
```
1. "Back" tab pe click karo
2. "Upload Backgrounds" button pe click karo
3. Modal mein:
   
   a) Column Select karo (same as front ya different):
      - Dropdown se column choose karo
   
   b) Group Create karo:
      - "Add Group" button pe click karo
      - Values select karo
      - "Create Group" pe click karo
   
   c) Background Upload karo:
      - ✅ Agar front side mein group hai, to back side upload enabled hoga
      - ❌ Agar front side mein group nahi hai, to "Upload front first" message aayega
      - Har group ke box pe click karo
      - Image select karo
   
   d) Card Size Set karo (same as front):
      - Width: 86mm
      - Height: 54mm
   
   e) "Save Changes" pe click karo
```

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────┐
│  CardPro Studio                         │
├─────────────────────────────────────────┤
│                                         │
│  [Front] [Back]  ← Tabs                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Upload Backgrounds Button       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Modal Opens:                    │   │
│  │                                 │   │
│  │ Select Column: [Dropdown ▼]    │   │
│  │                                 │   │
│  │ [+ Add Group]                   │   │
│  │                                 │   │
│  │ Groups:                         │   │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │   │
│  │ │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │   │   │
│  │ │Grp1│ │Grp2│ │Grp3│ │Grp4│   │   │
│  │ └────┘ └────┘ └────┘ └────┘   │   │
│  │                                 │   │
│  │ Width: [86] mm  Height: [54] mm│   │
│  │                                 │   │
│  │ [Cancel] [Save Changes]         │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📋 Example Workflow

### **Scenario: School ID Cards**

#### **Front Side:**
```
1. Excel Upload:
   - Columns: Name, Class, Roll No, Photo
   - Rows: 100 students

2. Front Background:
   - Column: "Class"
   - Groups:
     ✓ Group 1: Class A, B, C → blue_background.jpg
     ✓ Group 2: Class D, E, F → green_background.jpg
     ✓ Group 3: All Others → default_background.jpg

3. Card Size: 86mm x 54mm
```

#### **Back Side:**
```
1. Back Background:
   - Column: "Class" (same as front)
   - Groups:
     ✓ Group 1: Class A, B, C → blue_back.jpg
     ✓ Group 2: Class D, E, F → green_back.jpg
     ✓ Group 3: All Others → default_back.jpg

2. Card Size: 86mm x 54mm (same as front)
```

---

## 🔧 Advanced Features

### **1. Multiple Groups**
```
- Alag-alag values ke liye alag backgrounds
- Example:
  ✓ Boys → blue_bg.jpg
  ✓ Girls → pink_bg.jpg
  ✓ Staff → yellow_bg.jpg
```

### **2. Default Group**
```
- "Select All Values" check karo
- Sabke liye same background
- Useful for simple designs
```

### **3. Blank Values**
```
- Agar kisi row mein column value blank hai
- To "__BLANK__" group create karo
- Blank values ke liye special background
```

### **4. Custom Card Sizes**
```
Common Sizes:
- Credit Card: 85.6mm x 53.98mm
- Business Card: 90mm x 50mm
- ID Card: 86mm x 54mm
- Custom: Koi bhi size daal sakte ho
```

---

## ⚠️ Important Notes

1. **Excel First**: Pehle Excel upload karo, phir backgrounds
2. **Front First**: Front side configure karo, phir back side
3. **Same Column**: Front aur back mein same column use karo (recommended)
4. **Image Format**: JPG, PNG, GIF supported
5. **Image Size**: High resolution images use karo (300 DPI recommended)
6. **Group Names**: Automatically generate hote hain
7. **Delete Groups**: Trash icon se delete kar sakte ho

---

## 🎯 Quick Tips

✅ **Do's:**
- High quality images use karo
- Proper card size set karo
- Groups logically organize karo
- Front side pehle complete karo

❌ **Don'ts:**
- Low resolution images mat use karo
- Back side pehle upload mat karo
- Excel ke bina background upload mat karo
- Card size galat mat dalo

---

## 🐛 Troubleshooting

### **Problem: "Upload Excel First" button disabled**
**Solution:** Pehle Excel file upload karo

### **Problem: "Upload front first" message on back side**
**Solution:** Front side mein groups create karo aur backgrounds upload karo

### **Problem: Groups not showing**
**Solution:** Column select karo aur "Add Group" pe click karo

### **Problem: Image not uploading**
**Solution:** 
- Check file format (JPG/PNG)
- Check file size (not too large)
- Try different image

### **Problem: Card size not saving**
**Solution:** "Save Changes" button pe click karna mat bhulo

---

## 📞 Need Help?

Agar koi problem ho to:
1. Console check karo (F12)
2. Error message padho
3. Steps dobara follow karo
4. Excel data verify karo

---

## 🎉 Success!

Jab sab kuch upload ho jaye:
1. Front aur Back dono sides ready hongi
2. Preview mein dekh sakte ho
3. "Generate Cards" button pe click karo
4. PDF/Images download karo

**Happy Card Making! 🎊**
