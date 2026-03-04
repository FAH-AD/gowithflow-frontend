const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

function traverseAndReplace(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            traverseAndReplace(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Replacements for client -> company-member
            content = content.replace(/"\/client"/g, '"/company-member"');
            content = content.replace(/"\/client\//g, '"/company-member/');
            content = content.replace(/`\/client`/g, '`/company-member`');
            content = content.replace(/`\/client\//g, '`/company-member/');
            content = content.replace(/'\/client'/g, "'/company-member'");
            content = content.replace(/'\/client\//g, "'/company-member/");

            // Replacements for freelancer -> member
            content = content.replace(/"\/freelancer"/g, '"/member"');
            content = content.replace(/"\/freelancer\//g, '"/member/');
            content = content.replace(/`\/freelancer`/g, '`/member`');
            content = content.replace(/`\/freelancer\//g, '`/member/');
            content = content.replace(/'\/freelancer'/g, "'/member'");
            content = content.replace(/'\/freelancer\//g, "'/member/");

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

traverseAndReplace(directory);
console.log("Done");
