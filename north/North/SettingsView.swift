import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var pocket: Pocket

    var body: some View {
        let s = pocket.shade
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Settings")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(s.ink)
                    Text("Manage your emergency contacts and preferences")
                        .font(.system(size: 13))
                        .foregroundStyle(s.muted)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.blush)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(s.iconDeep)
                        .frame(width: 44, height: 44)
                        .overlay(Image(systemName: pocket.dark ? "moon.fill" : "sun.max.fill").foregroundStyle(.white))
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Dark Mode")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text(pocket.dark ? "Dark theme active" : "Light theme active")
                            .font(.system(size: 12))
                            .foregroundStyle(s.muted)
                    }
                    Spacer()
                    Toggle("", isOn: Binding(get: { pocket.dark }, set: { pocket.setDark($0) }))
                        .labelsHidden()
                        .tint(s.chip)
                }
                .padding(12)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)

                HStack {
                    Text("Emergency Contacts")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(s.ink)
                    Spacer()
                    Button {
                        pocket.askAdd()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "plus")
                            Text("Add Contact")
                        }
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(s.chip)
                        .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 6)

                ForEach(pocket.people) { person in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(s.iconSoft)
                            .frame(width: 40, height: 40)
                            .overlay(Image(systemName: "person.fill").foregroundStyle(.white))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(person.name)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(s.ink)
                            HStack(spacing: 4) {
                                Image(systemName: "phone").font(.system(size: 10)).foregroundStyle(s.muted)
                                Text(person.phone)
                                    .font(.system(size: 12))
                                    .foregroundStyle(s.muted)
                            }
                        }
                        Spacer()
                        Button {
                            pocket.dropPerson(person.id)
                        } label: {
                            Image(systemName: "trash")
                                .foregroundStyle(s.red)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(12)
                    .background(s.card)
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("About North Star")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(s.ink)
                    Text("North Star guides you safely with real-time alerts, location awareness, and AI-powered scam detection.")
                        .font(.system(size: 13))
                        .foregroundStyle(s.muted)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Version 1.0")
                        .font(.system(size: 12))
                        .foregroundStyle(s.muted)
                        .padding(.top, 6)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.blush)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 18)
        }
        .sheet(isPresented: $pocket.showAdd) {
            AddSheet()
        }
    }
}

struct AddSheet: View {
    @EnvironmentObject var pocket: Pocket
    @Environment(\.dismiss) var dismiss
    @State var name = ""
    @State var phone = ""

    var body: some View {
        let s = pocket.shade
        VStack(alignment: .leading, spacing: 14) {
            Text("Add Contact")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(s.ink)
            TextField("Name", text: $name)
                .padding(12)
                .background(s.field)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            TextField("Phone", text: $phone)
                .keyboardType(.phonePad)
                .padding(12)
                .background(s.field)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            Button {
                pocket.addPerson(name, phone)
                dismiss()
            } label: {
                Text("Save")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 46)
                    .background(s.chip)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .buttonStyle(.plain)
            Spacer()
        }
        .padding(20)
        .background(s.page)
        .presentationDetents([.height(300)])
    }
}
