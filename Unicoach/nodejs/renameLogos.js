const fs = require('fs-extra');
const path = require('path');

const logoFolder = path.join(__dirname, 'university_logos');

// ─── MANUAL MAPPING: exact current filename → correct university name ──────────
const exactMap = {
    // Pixel-prefixed + SVG noise
    '1200px Georgia Tech seal svg.png':                             'Georgia Institute of Technology.png',
    '1200px LSE Logo svg.png':                                     'London School of Economics.png',
    '1200px Massachusetts Institute of Technology logo svg.png':   'Massachusetts Institute of Technology.png',
    '1200px Ohio State University seal svg.png':                   'Ohio State University.png',
    '1200px Shield of the University of Cardiff svg.png':          'University of Cardiff.png',
    '1200px U Penn shield with banner svg.png':                    'University of Pennsylvania.png',
    '1200px University of Alberta seal svg.png':                   'University of Alberta.png',
    '1200px University of St Andrews arms svg.png':                'University of St Andrews.png',
    '1200px University of Washington seal svg.png':                'University of Washington.png',
    '1200px UR Shield svg.png':                                    'University of Rochester.png',
    '1636px Oxford University Circlet svg.png':                    'University of Oxford.png',
    '640px University of Texas at Austin seal svg.png':            'University of Texas at Austin.png',
    '800px CSU Los Angeles seal svg.png':                          'California State University Los Angeles.png',

    // Numeric ID prefixed filenames
    '01 After TJU logo.jpg':                                       'Thomas Jefferson University.jpg',
    '221 2219637 imperial college london logo college of london logo.png': 'Imperial College London.png',
    '304 3042502 swansea university logo white 1.png':             'Swansea University.png',
    '644 6444605 columbia university collection columbia university transparent logo hd.png': 'Columbia University.png',
    '657 6573745 drew rangers logo png transparent drew university rangers.png': 'Drew University.png',
    '3 University Logo Stacked.png':                               'University of Canterbury.png',

    // Timestamp prefixed
    '120162 logo purple stacked centre aligned.png':               'Heriot-Watt University.png',
    '1282588049482842419 1282588049482842419.png':                  'University of Sheffield (2).png',
    '1410376387764637220 1410376387764637220.png':                  'University of Birmingham.png',
    '1561064020 uc logo stacked colour digital.png':               'University of Canterbury (2).png',
    '1607527508 capture2.jfif':                                    'University of Strathclyde.jfif',
    '1612539026 09657 logo 512px studyportals.png':                'StudyPortals.png',
    '1613552519 black logo.jpg':                                   'Robert Gordon University.jpg',

    // Garbled encoded names
    'bt R Qc In4 Eu4 Pr UF Kc T Wjc Hhd AX 5 I887.png':          'University of Liverpool.png',
    'K0 KNVN 4g 400x400.png':                                     'Heriot-Watt University (2).png',
    'r D Ot NQN 400x400.png':                                     'Glasgow Caledonian University (2).png',
    'SWF 1 0 Kt 400x400.jpg':                                     'University of Stirling.jpg',
    '4r8d atn.jpg':                                               'Athabasca University.jpg',
    'luhsaith0seueqohlint.jpg':                                   'University of Limerick.jpg',
    'cmu australia.jpg':                                           'Carnegie Mellon University Australia.jpg',
    'concordia ca.jpg':                                            'Concordia University.jpg',
    'dcu.png':                                                     'Dublin City University.png',
    'dkitlogo fullcolour 1.jpg':                                   'Dundalk Institute of Technology.jpg',
    'federation square.png':                                       'RMIT University (2).png',
    'glos uni crest.jpg':                                          'University of Gloucestershire.jpg',
    'uwe logo.png':                                                'University of the West of England.png',
    'cccu logo.png':                                               'Canterbury Christ Church University.png',
    'rau col pos reduced new resized.jpg':                         'Royal Agricultural University.jpg',

    // Remaining noise in otherwise good names
    'Coat of arms of the University of Sheffield svg.png':         'University of Sheffield.png',
    'Birkbeck University of London crest svg.png':                 'Birkbeck University of London.png',
    'Deakin University Logo 2017.svg':                             'Deakin University.svg',
    'Loyola Marymount University LMU ceremonial mark.png':         'Loyola Marymount University.png',
    'Aston University 105.jpg':                                    'Aston University.jpg',
    'Charles Sturt logo 1.png':                                    'Charles Sturt University.png',
    'Drexel University logo.png':                                  'Drexel University.png',
    'logo The Australian National University 2020 08 11 15 13 46.png': 'Australian National University.png',
    'New Jersey IT logo svg.jpg':                                  'New Jersey Institute of Technology.jpg',
    'NYU Logo.png':                                                'New York University.png',
    'Oxford Brookes University.png':                               'Oxford Brookes University.png',   // already good
    'Simon Fraser University coat of arms.png':                    'Simon Fraser University.png',
    'TAB col white background.jpg':                                'Torrens University Australia.jpg',
    'Technological University of the Shannon TUS Emblem.png':      'Technological University of the Shannon.png',
    'the university of melbourne logo png transparent.png':        'University of Melbourne.png',
    'Thompson River University logo.png':                          'Thompson Rivers University.png',
    'Uni Westminster Coat of Arms.png':                            'University of Westminster.png',
    'Uni of the Sunshine Coast logo.jpg':                          'University of the Sunshine Coast.jpg',
    'UHI 1582369769.jpg':                                          'University of the Highlands and Islands.jpg',
    'University College Birmingham.jpg':                           'University College Birmingham.jpg',  // good
    'university college london ucl.jpg':                           'University College London.jpg',
    'University for the Creative Arts 2015 logo svg.png':          'University for the Creative Arts.png',
    'University Of Dundee Ninewells.png':                          'University of Dundee.png',
    'University Of Hertfordshire logo.png':                        'University of Hertfordshire.png',
    'university of huddersfield logo png transparent.png':         'University of Huddersfield.png',
    'University Of Lethbridge logo.png':                           'University of Lethbridge.png',
    'University Of Liverpool Kaplan.jpg':                          'University of Liverpool (2).jpg',
    'University Of London International Programmes.jpg':           'University of London.jpg',
    'university of newcastle logo E447988377 seeklogo com.png':    'University of Newcastle.png',
    'university of northampton logo vector.png':                   'University of Northampton.png',
    'university of strathclyde logo freelogovectors net.png':      'University of Strathclyde (2).png',
    'University of Sussex logo.png':                               'University of Sussex.png',
    'University Of Warwick logo.png':                              'University of Warwick.png',
    'University of Exeter logo.png':                               'University of Exeter.png',
    'Western Sydney University emblem.png':                        'Western Sydney University.png',
    'national university of ireland galway nui galway logo vector.png': 'National University of Ireland Galway.png',
    'swinburne university of technology 4.svg':                    'Swinburne University of Technology.svg',
    'Sydney Business School University Of Wollongong.jpg':         'University of Wollongong.jpg',
    'Northumbria University logo.png':                             'Northumbria University.png',
    'Solent University logo.png':                                  'Solent University.png',
    'Southern Cross vertical.png':                                 'Southern Cross University.png',
    'brescia university college logo.png':                         'Brescia University College.png',
    'King s College London.png':                                   "King's College London.png",
    'King s University.png':                                       "King's University.png",
    'Saint Joseph s University.png':                               "Saint Joseph's University.png",
    'leeds trinity university.png':                                'Leeds Trinity University.png',
    'British Council Uo A Stacked Logo RGB square.jpg':            'University of Aberdeen.jpg',
    'A1 Full Colour.png':                                          'University of Aberdeen (2).png',
    'logo.jpg':                                                    'University of Huddersfield (2).jpg',
    'Mac Ewan University.png':                                     'MacEwan University.png',
    'Mcgill University.png':                                       'McGill University.png',
    'Rmit University.png':                                         'RMIT University.png',
    'brand x xavier 1205.webp':                                    'Xavier University.webp',
    'shutterstock 1106315942.jpg':                                 'University of Derby.jpg',
    'shutterstock 1845651232.jpg':                                 'University of Manchester.jpg',
    'Website Logos4.jpg':                                          'Swansea University (2).jpg',
    'unnamed.jpg':                                                 'London Metropolitan University.jpg',
    '1200px LSE Logo svg.png':                                     'London School of Economics.png',

    // Hash-only files that can be identified from position in Ireland/UK lists
    '6175b15dab809.png':                                           'Institute of Technology Carlow.png',
    'bc37906da673141e9773f02723cc8b4e.jpeg':                       'Trinity College Dublin.jpeg',
    '19de5a0c6e9eb7d44d8b2c26435adf3b.jpeg':                      'University of Edinburgh.jpeg',
    '76ce284b7bbdb720192dc59544d33433.jpeg':                       'University of Glasgow.jpeg',
    '186a396fd0cab5c4fb2a83f2adb860df.jpeg':                       'Cardiff Metropolitan University.jpeg',
    '166051419c617aa6b67e6c4c31c949e7.jpeg':                       'University of Leicester.jpeg',
    '9a75c01d17a847992f4c37c5ef816f3d.jpeg':                       'Temple University.jpeg',
    'ddb8decde3b150fb7668d3e946b9a018.png':                        'University of Ottawa.png',
};

// ─── REGEX RULES: applied to ALL files not in exactMap ───────────────────────
function autoClean(name, ext) {
    // 1. Remove leading pixel dimensions: "1200px ", "640px ", "800px ", "1636px "
    name = name.replace(/^\d+px\s+/i, '');

    // 2. Remove "NNN NNNNNNN " numeric ID prefixes
    name = name.replace(/^\d{1,6}\s+\d{5,12}\s+/g, '');

    // 3. Remove long timestamp prefixes "1607527508 "
    name = name.replace(/^\d{9,11}\s+/g, '');

    // 4. Remove dimension suffixes like " 400x400"
    name = name.replace(/\s+\d+x\d+$/i, '');

    // 5. Remove trailing SVG/logo/seal/arms/shield/crest noise
    name = name
        .replace(/\s+seal\s+svg$/i, '')
        .replace(/\s+arms\s+svg$/i, '')
        .replace(/\s+circlet\s+svg$/i, '')
        .replace(/\s+shield\s+svg$/i, '')
        .replace(/\s+logo\s+svg$/i, '')
        .replace(/\s+svg$/i, '')
        .replace(/\s+seal$/i, '')
        .replace(/\s+crest$/i, '')
        .replace(/\s+emblem$/i, '')
        .replace(/\s+arms$/i, '')
        .replace(/\s+coat\s+of\s+arms$/i, '')
        .replace(/\s+logo\s+png\s+transparent$/i, '')
        .replace(/\s+png\s+transparent$/i, '')
        .replace(/\s+logo$/i, '')
        .replace(/\s+logo\s+vector$/i, '')
        .replace(/\s+vector$/i, '');

    // 6. Remove trailing numbers like " 1", " 2", "105"
    name = name.replace(/\s+\d+$/, '');

    // 7. Trim
    name = name.replace(/\s+/g, ' ').trim();

    // 8. Title case (capitalize first letter of each word)
    name = name.replace(/\b\w/g, c => c.toUpperCase());

    // Fix known abbreviations to proper case
    name = name
        .replace(/\bOf\b/g, 'of')
        .replace(/\bThe\b/g, 'the')
        .replace(/\bFor\b/g, 'for')
        .replace(/\bAnd\b/g, 'and')
        .replace(/\bAt\b/g, 'at')
        .replace(/\bIn\b/g, 'in')
        .replace(/\bA\b/g, 'a');

    // Always capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return name + ext.toLowerCase();
}

async function renameAll() {
    const files = await fs.readdir(logoFolder);
    const usedNames = new Set(files.map(f => f.toLowerCase()));

    let renamed = 0;
    let skipped = 0;

    console.log(`\n🔄 Processing ${files.length} files...\n`);

    for (const file of files) {
        const oldPath = path.join(logoFolder, file);
        const ext = path.extname(file);
        const nameOnly = path.basename(file, ext);

        let newName;

        // Check exact map first
        if (exactMap[file]) {
            newName = exactMap[file];
        } else {
            // Auto-clean
            const cleaned = autoClean(nameOnly, ext);
            if (cleaned === file) {
                skipped++;
                continue;
            }
            newName = cleaned;
        }

        // Handle conflicts
        if (newName.toLowerCase() !== file.toLowerCase() && usedNames.has(newName.toLowerCase())) {
            const newExt = path.extname(newName);
            const newBase = path.basename(newName, newExt);
            let counter = 2;
            while (usedNames.has(`${newBase} (${counter})${newExt}`.toLowerCase())) counter++;
            newName = `${newBase} (${counter})${newExt}`;
        }

        if (newName === file) {
            skipped++;
            continue;
        }

        const newPath = path.join(logoFolder, newName);
        try {
            await fs.rename(oldPath, newPath);
            usedNames.delete(file.toLowerCase());
            usedNames.add(newName.toLowerCase());
            console.log(`  ✅ ${file}`);
            console.log(`     → ${newName}`);
            renamed++;
        } catch (err) {
            console.log(`  ❌ Error: ${file} => ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(65));
    console.log(`✅ Renamed:  ${renamed} files`);
    console.log(`⏭️  Skipped:  ${skipped} files (already clean)`);
    console.log(`📁 Folder:   ${logoFolder}`);
    console.log('='.repeat(65) + '\n');
}

renameAll();
